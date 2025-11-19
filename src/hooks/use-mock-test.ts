

"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocalStorage } from './use-local-storage';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { User } from 'firebase/auth';
import type { MockTest, TestQuestion, TestResponse, TestResult, ExamResult } from '@/lib/types';
import { saveTestResult, saveExamResult } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export const useMockTest = (testId: string, registrationNumber?: string | null, studentName?: string | null) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isInitialized, setIsInitialized] = useState(false);

    // Use a more generic key and then add user-specific part if available
    const getStorageKey = (base: string) => {
        if (registrationNumber) return `exam-${testId}-${registrationNumber}-${base}`;
        // Fallback for non-registered tests, assumes a user is logged in, but we handle that in the component
        return `test-${testId}-${base}`;
    }

    const [selectedAnswers, setSelectedAnswers] = useLocalStorage<(number | null)[]>(
        getStorageKey('answers'), 
        []
    );
    const [markedForReview, setMarkedForReview] = useLocalStorage<number[]>(
        getStorageKey('review'),
        []
    );

    const [timeLeft, setTimeLeft] = useLocalStorage<number>(getStorageKey('time'), 0);
    const [isTimeUp, setIsTimeUp] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const initialDurationRef = useRef<number>(0);
    
    const initializeTest = useCallback((questionCount: number, durationMinutes: number) => {
        if (isInitialized) return;

        initialDurationRef.current = durationMinutes * 60;
        
        const storedTimeItem = typeof window !== 'undefined' ? localStorage.getItem(getStorageKey('time')) : null;
        const storedTime = storedTimeItem ? Number(JSON.parse(storedTimeItem)) : NaN;
        
        if (isNaN(storedTime) || storedTime <= 0) {
            setTimeLeft(initialDurationRef.current);
        }

        const storedAnswersItem = typeof window !== 'undefined' ? localStorage.getItem(getStorageKey('answers')) : null;
        if (storedAnswersItem === null) {
            setSelectedAnswers(Array(questionCount).fill(null));
        } else {
            try {
                const parsedAnswers = JSON.parse(storedAnswersItem);
                if (parsedAnswers.length !== questionCount) {
                    setSelectedAnswers(Array(questionCount).fill(null));
                }
            } catch {
                setSelectedAnswers(Array(questionCount).fill(null));
            }
        }
        
        setIsInitialized(true);
    }, [isInitialized, testId, registrationNumber, setTimeLeft, setSelectedAnswers]);


    // Timer effect
    useEffect(() => {
        if (!isInitialized || timeLeft <= 0 || isSubmitting) {
            if (timeLeft <= 0 && isInitialized) {
                 setIsTimeUp(true);
            }
            return;
        };

        timerRef.current = setInterval(() => {
            setTimeLeft(prevTime => {
                if (prevTime <= 1) {
                    clearInterval(timerRef.current!);
                    setIsTimeUp(true);
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isInitialized, setTimeLeft, timeLeft, isSubmitting]);
    
    const handleSelectAnswer = useCallback((questionIndex: number, optionIndex: number) => {
        setSelectedAnswers(prev => {
            const newAnswers = [...prev];
            newAnswers[questionIndex] = optionIndex;
            return newAnswers;
        });
    }, [setSelectedAnswers]);

    const toggleMarkForReview = useCallback((questionIndex: number) => {
        setMarkedForReview(prev => {
            if (prev.includes(questionIndex)) {
                return prev.filter(i => i !== questionIndex);
            } else {
                return [...prev, questionIndex];
            }
        });
    }, [setMarkedForReview]);

    const cleanupLocalStorage = useCallback(() => {
        window.localStorage.removeItem(getStorageKey('answers'));
        window.localStorage.removeItem(getStorageKey('review'));
        window.localStorage.removeItem(getStorageKey('time'));
    }, [testId, registrationNumber]);

    const handleSubmit = useCallback(async (
        isAutoSubmit: boolean, 
        router: AppRouterInstance, 
        toast: ReturnType<typeof useToast>['toast'],
        testData: MockTest,
        user: User | null
        ) => {
        
        if (isSubmitting) return;
        
        if (!user) {
            toast({
                title: "Authentication Error",
                description: "You must be logged in to submit a test.",
                variant: 'destructive'
            });
            return;
        }

        setIsSubmitting(true);

        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        let score = 0;
        let correctAnswers = 0;

        const responses: TestResponse[] = testData.questions.map((q, i) => {
            const selectedOption = selectedAnswers[i];
            const isCorrect = selectedOption === q.correctOption;
            const questionMarks = q.marks || 1; // Default to 1 mark if not specified
            const marksAwarded = isCorrect ? questionMarks : 0;
            if (isCorrect) {
                score += marksAwarded;
                correctAnswers++;
            }
            return {
                questionId: q.id,
                selectedOption: selectedOption === undefined || selectedOption === null ? null : selectedOption,
                isCorrect,
                marksAwarded
            };
        });

        const attemptedQuestions = selectedAnswers.filter(a => a !== null && a !== undefined).length;
        const accuracy = attemptedQuestions > 0 ? (correctAnswers / attemptedQuestions) * 100 : 0;
        
        let timeTaken = initialDurationRef.current - timeLeft;
        if (isNaN(timeTaken) || timeTaken < 0) {
            timeTaken = 0;
        }
        
        // Helper function to remove any undefined fields before Firestore write
        const cleanData = (obj: any): any => {
            if (Array.isArray(obj)) {
                return obj.map(v => cleanData(v));
            } else if (obj !== null && typeof obj === 'object') {
                return Object.entries(obj)
                    .filter(([_, v]) => v !== undefined)
                    .reduce((acc, [k, v]) => ({ ...acc, [k]: cleanData(v) }), {});
            }
            return obj;
        };

        try {
            let resultId: string;
            
            const message = isAutoSubmit 
                ? "Time's up! Your test has been automatically submitted."
                : "Your test has been submitted successfully.";

            if (registrationNumber && studentName) {
                // This is a registered exam
                const examResultData: Omit<ExamResult, 'id' | 'submittedAt'> = {
                    registrationNumber,
                    studentName,
                    testId: testData.id,
                    testName: testData.title,
                    score,
                    totalMarks: testData.totalMarks,
                    accuracy: parseFloat(accuracy.toFixed(2)) || 0,
                    timeTaken: timeTaken,
                    responses,
                };
                const finalData = cleanData(examResultData);
                resultId = await saveExamResult(finalData);
                toast({ title: "Exam Submitted", description: message });
                router.push(`/exam/result/${resultId}`);
            } else {
                 // This is a general mock test
                const resultData: Omit<TestResult, 'id' | 'submittedAt'> = {
                    userId: user.uid,
                    userName: user.displayName || user.email || 'Anonymous',
                    testId: testData.id,
                    testTitle: testData.title,
                    score,
                    totalMarks: testData.totalMarks,
                    accuracy: parseFloat(accuracy.toFixed(2)) || 0,
                    timeTaken: timeTaken,
                    responses,
                };
                const finalData = cleanData(resultData);
                resultId = await saveTestResult(finalData);
                toast({ title: "Test Submitted", description: message });
                router.push(`/mock-tests/result/${resultId}`);
            }
            
            cleanupLocalStorage();

        } catch (error) {
             console.error("Failed to save test results:", error);
             toast({
                title: "Submission Failed",
                description: "Could not save your test results. Please try again.",
                variant: 'destructive'
             });
             setIsSubmitting(false);
        }

    }, [selectedAnswers, timeLeft, cleanupLocalStorage, isSubmitting, registrationNumber, studentName]);

    return {
        isInitialized,
        initializeTest,
        currentQuestionIndex,
        setCurrentQuestionIndex,
        selectedAnswers,
        handleSelectAnswer,
        markedForReview,
        toggleMarkForReview,
        timeLeft,
        isTimeUp,
        isSubmitting,
        handleSubmit
    };
};
