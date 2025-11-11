
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocalStorage } from './use-local-storage';

export const useMockTest = (testId: string, questionCount: number, durationMinutes: number) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    const [selectedAnswers, setSelectedAnswers] = useLocalStorage<(number | null)[]>(
        `test-${testId}-answers`, 
        Array(questionCount).fill(null)
    );
    const [markedForReview, setMarkedForReview] = useLocalStorage<number[]>(
        `test-${testId}-review`,
        []
    );

    const initialTime = durationMinutes * 60;
    const [timeLeft, setTimeLeft] = useLocalStorage<number>(`test-${testId}-time`, initialTime);
    const [isTimeUp, setIsTimeUp] = useState(false);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Timer effect
    useEffect(() => {
        if (durationMinutes > 0 && questionCount > 0) {
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
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [durationMinutes, questionCount, setTimeLeft]);
    
    // Ensure array sizes are correct when data loads
    useEffect(() => {
        if(questionCount > 0) {
            if(selectedAnswers.length !== questionCount) {
                const newAnswers = Array(questionCount).fill(null);
                // Preserve old answers if any
                for(let i=0; i<Math.min(selectedAnswers.length, questionCount); i++) {
                    newAnswers[i] = selectedAnswers[i];
                }
                setSelectedAnswers(newAnswers);
            }
        }
    }, [questionCount, selectedAnswers, setSelectedAnswers]);


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

    const handleSubmit = useCallback((isAutoSubmit: boolean) => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        // TODO: Implement the logic to save the results to the database.
        // This will involve calculating the score and sending `selectedAnswers`
        // to a server action or API endpoint.
        
        console.log("Submitting test. Answers:", selectedAnswers);
        if(isAutoSubmit) {
            console.log("Test was auto-submitted due to time up.");
        }

        // For now, just log and clean up.
        cleanupLocalStorage();

    }, [selectedAnswers, cleanupLocalStorage]);

    return {
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


// A hook to use localStorage with React state
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue] as const;
}
