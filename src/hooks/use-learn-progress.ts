

"use client";

import { useState, useEffect, useCallback } from 'react';
import type { LearningCourse, UserProgress } from '@/lib/types';
import { useUser, useFirestore } from '@/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

// Helper to get total lesson count from a LIVE course object
const getTotalLessonsFromCourse = (course: LearningCourse | null): number => {
    if (!course || !course.modules) return 0;
    return course.modules.reduce((acc, module) => acc + (module.lessons?.length || 0), 0);
};

export const useLearnProgress = () => {
    const { user } = useUser();
    const db = useFirestore();
    const [progress, setProgress] = useState<UserProgress>({});
    const [isLoading, setIsLoading] = useState(true);

    const updateUserProgress = async (userId: string, newProgress: UserProgress) => {
        if (!db) return;
        const docRef = doc(db, 'userProgress', userId);
        await setDoc(docRef, newProgress, { merge: true });
    };

    // Set up a real-time listener for user progress
    useEffect(() => {
        if (user && db) {
            setIsLoading(true);
            const docRef = doc(db, 'userProgress', user.uid);
            
            const unsubscribe = onSnapshot(docRef, (docSnap) => {
                if (docSnap.exists()) {
                    setProgress(docSnap.data() as UserProgress);
                } else {
                    // No progress document exists, so set to empty
                    setProgress({});
                }
                setIsLoading(false);
            }, (error) => {
                console.error("Error listening to progress updates:", error);
                setIsLoading(false);
            });

            // Cleanup listener on component unmount or user change
            return () => unsubscribe();
        } else if (!user) {
            // If user is logged out, clear progress and loading state
            setProgress({});
            setIsLoading(false);
        }
    }, [user, db]);

    // This function now ONLY writes to the database.
    // The local state will be updated by the onSnapshot listener.
    const saveProgress = useCallback(async (newProgress: UserProgress) => {
        if (!user || !db) return;
        await updateUserProgress(user.uid, newProgress);
    }, [user, db]);
    
    const isLessonCompleted = useCallback((courseId: string, lessonId: string): boolean => {
        return !!progress[courseId]?.completedLessons?.includes(lessonId);
    }, [progress]);

    const toggleLessonCompleted = useCallback((courseId: string, lessonId: string) => {
        if (!user) return;

        const currentCourseProgress = progress[courseId] || { completedLessons: [] };
        const isCompleted = currentCourseProgress.completedLessons.includes(lessonId);
        
        let newCompletedLessons: string[];
        if (isCompleted) {
            newCompletedLessons = currentCourseProgress.completedLessons.filter(id => id !== lessonId);
        } else {
            newCompletedLessons = [...currentCourseProgress.completedLessons, lessonId];
        }

        const newProgressData: UserProgress = {
            ...progress,
            [courseId]: {
                ...currentCourseProgress,
                completedLessons: newCompletedLessons,
                lastVisitedLesson: lessonId,
            },
        };

        saveProgress(newProgressData);

    }, [progress, saveProgress, user]);
    
    const getCourseProgress = useCallback((course: LearningCourse | null): { completedCount: number, totalLessons: number, progressPercentage: number } => {
        if (!course) {
            return { completedCount: 0, totalLessons: 0, progressPercentage: 0 };
        }
        
        const completedLessons = progress[course.id]?.completedLessons || [];
        const totalLessons = getTotalLessonsFromCourse(course);
        const completedCount = completedLessons.length;
        
        if (totalLessons === 0) {
            return { completedCount: 0, totalLessons: 0, progressPercentage: 0 };
        }
        
        const progressPercentage = (completedCount / totalLessons) * 100;
        
        return {
            completedCount,
            totalLessons,
            progressPercentage,
        };

    }, [progress]);
    
    const updateLastVisitedLesson = useCallback((courseId: string, lessonId: string) => {
        if (!user) return;
        
        if (progress[courseId]?.lastVisitedLesson === lessonId) {
            return;
        }

        const newProgressData: UserProgress = {
            ...progress,
            [courseId]: {
                ...(progress[courseId] || { completedLessons: [] }),
                lastVisitedLesson: lessonId,
            },
        };
        saveProgress(newProgressData);
    }, [progress, saveProgress, user]);


    return {
        progress,
        isLoading,
        isLessonCompleted,
        toggleLessonCompleted,
        getCourseProgress,
        updateLastVisitedLesson
    };
};
