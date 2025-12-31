

"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocalStorage } from './use-local-storage';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { User } from 'firebase/auth';
import { useFirestore } from '@/firebase';
import { doc, getDocs, query, collection, where, runTransaction, serverTimestamp, getDoc, addDoc } from "firebase/firestore";
import type { MockTest, TestQuestion, TestResponse, TestResult, ExamResult, ExamRegistration, Certificate } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";
import { generateCertificatePdf } from '@/lib/certificate-generator';

export const useMockTest = (testId: string) => {
    const { toast } = useToast();
    const db = useFirestore();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isInitialized, setIsInitialized] = useState(false);

    // Use a more generic key and then add user-specific part if available
    const getStorageKey = useCallback((base: string, regNo?: string | null) => {
        if (regNo) return `exam-${testId}-${regNo}-${base}`;
        return `test-${testId}-${base}`;
    }, [testId]);

    const cleanupLocalStorage = useCallback((regNo?: string | null) => {
        window.localStorage.removeItem(getStorageKey('answers', regNo));
        window.localStorage.removeItem(getStorageKey('review', regNo));
        window.localStorage.removeItem(getStorageKey('time', regNo));
    }, [getStorageKey]);

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
    
    const initializeTest = useCallback((questionCount: number, durationMinutes: number, regNo?: string | null) => {
        if (isInitialized) return;
        
        // Clear any previous state for this test before initializing
        cleanupLocalStorage(regNo);

        initialDurationRef.current = durationMinutes * 60;
        
        setTimeLeft(initialDurationRef.current);
        setSelectedAnswers(Array(questionCount).fill(null));
        setMarkedForReview([]);
        setCurrentQuestionIndex(0);
        
        setIsInitialized(true);
    }, [isInitialized, cleanupLocalStorage, setTimeLeft, setSelectedAnswers, setMarkedForReview]);


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

    const saveExamResult = async (result: Omit<ExamResult, 'id' | 'submittedAt'>): Promise<string> => {
        if (!db) throw new Error("Firestore is not initialized.");
        const resultWithTimestamp = {
            ...result,
            submittedAt: serverTimestamp(),
        };
        const docRef = await addDoc(collection(db, 'examResults'), resultWithTimestamp);
        return docRef.id;
    };

    const handleSubmit = useCallback(async (
        isAutoSubmit: boolean, 
        router: AppRouterInstance, 
        testData: MockTest,
        user: User,
        registrationNumber: string | null,
        studentName: string | null
        ) => {
        
        if (isSubmitting || !db) return;
        
        setIsSubmitting(true);

        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        
        const isOfficialExam = !!registrationNumber;
        
        let finalRegistrationNumber = registrationNumber;
        let finalStudentName = studentName;
        let examDate = new Date();

        try {
            if (isOfficialExam && registrationNumber) {
                 const regQuery = query(collection(db, "examRegistrations"), where("registrationNumber", "==", registrationNumber));
                 const regSnap = await getDocs(regQuery);
                 
                 if (!regSnap.empty) {
                    const regData = regSnap.docs[0].data() as ExamRegistration;
                    finalStudentName = regData.fullName;
                    // @ts-ignore
                    examDate = regData.registeredAt?.toDate ? regData.registeredAt.toDate() : new Date();
                 }
            } else {
                finalRegistrationNumber = user.uid;
                finalStudentName = user.displayName || user.email || 'Anonymous';
            }
            
            if (!finalRegistrationNumber || !finalStudentName) {
                toast({ title: "Error", description: "Could not verify student details.", variant: "destructive" });
                setIsSubmitting(false);
                return;
            }

            let score = 0;
            let correctAnswers = 0;

            const responses: TestResponse[] = testData.questions.map((q, i) => {
                const selectedOption = selectedAnswers[i];
                const isCorrect = selectedOption === q.correctOption;
                const questionMarks = q.marks || 1;
                if (isCorrect) {
                    score += questionMarks;
                    correctAnswers++;
                }
                return {
                    questionId: q.id,
                    selectedOption: selectedOption === undefined || selectedOption === null ? null : selectedOption,
                    isCorrect,
                    marksAwarded: isCorrect ? questionMarks : 0,
                };
            });

            const attemptedQuestions = selectedAnswers.filter(a => a !== null && a !== undefined).length;
            const accuracy = attemptedQuestions > 0 ? (correctAnswers / attemptedQuestions) * 100 : 0;
            
            let timeTaken = initialDurationRef.current - timeLeft;
            if (isNaN(timeTaken) || timeTaken < 0) {
                timeTaken = 0;
            }

            // Generate Certificate ID
            const currentYear = new Date().getFullYear();
            const randomSuffix = Math.floor(100000 + Math.random() * 900000);
            const certificateId = `CERT-${currentYear}-${randomSuffix}`;
            
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

            const resultData = {
                userId: user.uid, // IMPORTANT: Add userId for security rules
                registrationNumber: finalRegistrationNumber,
                studentName: finalStudentName,
                testId: testData.id,
                testName: testData.title,
                score,
                totalMarks: testData.totalMarks,
                accuracy: parseFloat(accuracy.toFixed(2)) || 0,
                timeTaken: timeTaken,
                responses,
                certificateId: certificateId,
            };
            
            const finalResultData = cleanData(resultData);
            const resultId = await saveExamResult(finalResultData as Omit<ExamResult, 'id'|'submittedAt'>);

            toast({
                title: isOfficialExam ? "Exam Submitted" : "Test Submitted",
                description: isAutoSubmit
                    ? `Time's up! Your ${isOfficialExam ? 'exam' : 'test'} has been automatically submitted.`
                    : `Your ${isOfficialExam ? 'exam' : 'test'} has been submitted successfully.`
            });
            
            router.push(`/exam/result/${resultId}`);
            
            cleanupLocalStorage(registrationNumber);

        } catch (error) {
             console.error("Failed to save test results:", error);
             toast({
                title: "Submission Failed",
                description: "Could not save your test results. Please try again.",
                variant: 'destructive'
             });
             setIsSubmitting(false); // Reset submitting state on error
        }

    }, [selectedAnswers, timeLeft, cleanupLocalStorage, isSubmitting, toast, getStorageKey, db]);

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
        handleSubmit,
        getStorageKey
    };
};
