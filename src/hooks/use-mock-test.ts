
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocalStorage } from './use-local-storage';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

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

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    
    const initializeTest = useCallback((questionCount: number, durationMinutes: number) => {
        if (isInitialized) return;

        const initialTime = durationMinutes * 60;
        
        // Only set initial values if they haven't been set before (i.e., user refreshes)
        if (localStorage.getItem(`test-${testId}-time`) === null) {
            setTimeLeft(initialTime);
        }
        if (localStorage.getItem(`test-${testId}-answers`) === null) {
            setSelectedAnswers(Array(questionCount).fill(null));
        }

        setIsInitialized(true);
    }, [isInitialized, testId, setTimeLeft, setSelectedAnswers]);

    // Timer effect
    useEffect(() => {
        if (!isInitialized || timeLeft <= 0) return;

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
    }, [isInitialized, setTimeLeft, timeLeft]);
    
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

    const handleSubmit = useCallback((
        isAutoSubmit: boolean, 
        router: AppRouterInstance, 
        toast: (options: { title: string, description: string }) => void
        ) => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        // TODO: Implement the logic to save the results to the database.
        
        console.log("Submitting test. Answers:", selectedAnswers);
        
        const message = isAutoSubmit 
            ? "Time's up! Your test has been automatically submitted."
            : "Your test has been submitted successfully.";

        toast({
            title: "Test Submitted",
            description: message,
        });

        cleanupLocalStorage();
        
        router.push('/mock-tests');

    }, [selectedAnswers, cleanupLocalStorage]);

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
        handleSubmit
    };
};

    