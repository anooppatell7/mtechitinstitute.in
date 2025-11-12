
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocalStorage } from './use-local-storage';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { User } from 'firebase/auth';
import type { MockTest, TestQuestion, TestResponse, TestResult } from '@/lib/types';
import { saveTestResult } from '@/lib/firebase';
import { UseToast } from '@/hooks/use-toast';

export const useMockTest = (testId: string) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isInitialized, setIsInitialized] = useState(false);

    const [selectedAnswers, setSelectedAnswers] = useLocalStorage<(number | null)[]>(
        `test-${testId}-answers`, 
        []
    );
    const [markedForReview, setMarkedForReview] = useLocalStorage<number[]>(
        `test-${testId}-review`,
        []
    );

    const [timeLeft, setTimeLeft] = useLocalStorage<number>(`test-${testId}-time`, 0);
    const [isTimeUp, setIsTimeUp] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const initialDurationRef = useRef<number>(0);
    
    const initializeTest = useCallback((questionCount: number, durationMinutes: number) => {
        if (isInitialized) return;

        initialDurationRef.current = durationMinutes * 60;
        
        // Only set the time if it's a fresh start.
        // Check if there's any time stored. If it's 0 or not a number, it's likely a new test.
        const storedTime = Number(localStorage.getItem(`test-${testId}-time`));
        if (isNaN(storedTime) || storedTime <= 0) {
            setTimeLeft(initialDurationRef.current);
        }

        const storedAnswers = localStorage.getItem(`test-${testId}-answers`);
        if (storedAnswers === null) {
            setSelectedAnswers(Array(questionCount).fill(null));
        } else {
            // Ensure the stored array matches the question count
            const parsedAnswers = JSON.parse(storedAnswers);
            if (parsedAnswers.length !== questionCount) {
                setSelectedAnswers(Array(questionCount).fill(null));
            }
        }
        
        setIsInitialized(true);
    }, [isInitialized, testId, setTimeLeft, setSelectedAnswers]);

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
        window.localStorage.removeItem(`test-${testId}-answers`);
        window.localStorage.removeItem(`test-${testId}-review`);
        window.localStorage.removeItem(`test-${testId}-time`);
    }, [testId]);

    const handleSubmit = useCallback(async (
        isAutoSubmit: boolean, 
        router: AppRouterInstance, 
        toast: ReturnType<typeof UseToast>['toast'],
        testData: MockTest,
        user: User | null
        ) => {
        
        if (isSubmitting) return;
        
        if (!user?.uid) {
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
            const marksAwarded = isCorrect ? q.marks : 0;
            if (isCorrect) {
                score += q.marks;
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
        
        const resultData: Omit<TestResult, 'id' | 'submittedAt'> = {
            userId: user.uid,
            userName: user.displayName || user.email || 'Anonymous',
            testId: testData.id,
            testTitle: testData.title,
            score: score || 0,
            totalMarks: testData.totalMarks,
            accuracy: parseFloat(accuracy.toFixed(2)) || 0,
            timeTaken: timeTaken,
            responses,
        };
        
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
        
        const finalData = cleanData(resultData);

        try {
            console.log("Attempting to save test result:", finalData);
            const resultId = await saveTestResult(finalData);
            
            const message = isAutoSubmit 
                ? "Time's up! Your test has been automatically submitted."
                : "Your test has been submitted successfully.";

            toast({
                title: "Test Submitted",
                description: message,
            });

            cleanupLocalStorage();
            router.push(`/mock-tests/result/${resultId}`);

        } catch (error) {
             console.error("Failed to save test results:", error);
             toast({
                title: "Submission Failed",
                description: "Could not save your test results. Please try again.",
                variant: 'destructive'
             });
             setIsSubmitting(false);
        }

    }, [selectedAnswers, timeLeft, cleanupLocalStorage, isSubmitting, toast, router]);

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
