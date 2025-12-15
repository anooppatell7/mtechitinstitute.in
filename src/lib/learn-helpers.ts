

import { initializeFirebase } from '@/firebase';
import { collection, doc, getDoc, getDocs, query, orderBy } from 'firebase/firestore';
import type { LearningCourse, LearningModule, Lesson } from './types';

// Memoization cache
const courseCache = new Map<string, LearningCourse>();

// Function to fetch all courses and their subcollections from Firestore
export async function getAllCourses(): Promise<LearningCourse[]> {
    const { db } = initializeFirebase();
    if (courseCache.size > 0) {
        // This is a simple cache, for production you might want a more sophisticated strategy
        // return Array.from(courseCache.values());
    }
    
    if (!db) {
        console.error("Firestore not initialized in getAllCourses");
        return [];
    }

    const coursesQuery = query(collection(db, "learningCourses"), orderBy("order"));
    const coursesSnapshot = await getDocs(coursesQuery);
    
    const courseList = await Promise.all(coursesSnapshot.docs.map(async (courseDoc) => {
        const courseData = { id: courseDoc.id, ...courseDoc.data() } as LearningCourse;
        
        const modulesQuery = query(collection(db, "learningCourses", courseDoc.id, "modules"), orderBy("order"));
        const modulesSnapshot = await getDocs(modulesQuery);
        
        courseData.modules = await Promise.all(modulesSnapshot.docs.map(async (moduleDoc) => {
            const moduleData = { id: moduleDoc.id, ...moduleDoc.data() } as LearningModule;

            const lessonsQuery = query(collection(db, "learningCourses", courseDoc.id, "modules", moduleDoc.id, "lessons"), orderBy("order"));
            const lessonsSnapshot = await getDocs(lessonsQuery);
            moduleData.lessons = lessonsSnapshot.docs.map(lessonDoc => ({ id: lessonDoc.id, ...lessonDoc.data() } as Lesson));
            
            return moduleData;
        }));

        return courseData;
    }));

    // Update cache
    courseList.forEach(course => courseCache.set(course.id, course));
    return courseList;
}


export async function getCourseData(slug: string): Promise<LearningCourse | null> {
    if (courseCache.has(slug)) {
        return courseCache.get(slug)!;
    }
    
    // If not in cache, fetch all courses to populate cache
    await getAllCourses();
    
    if (courseCache.has(slug)) {
        return courseCache.get(slug)!;
    }

    return null;
}

export async function getLessonData(courseSlug: string, lessonSlug: string): Promise<{
    course: LearningCourse | null,
    module: LearningModule | null,
    lesson: Lesson | null
}> {
    const course = await getCourseData(courseSlug);
    if (!course) {
        return { course: null, module: null, lesson: null };
    }

    for (const module of course.modules) {
        const lesson = module.lessons.find(l => l.id === lessonSlug);
        if (lesson) {
            return { course, module, lesson };
        }
    }

    return { course, module: null, lesson: null };
}

export async function getNextPrevLessons(courseSlug: string, moduleSlug: string, lessonSlug: string): Promise<{
    prevLesson: Lesson | null,
    nextLesson: Lesson | null
}> {
    const course = await getCourseData(courseSlug);
    if (!course) {
        return { prevLesson: null, nextLesson: null };
    }

    const allLessons: { lesson: Lesson, moduleId: string }[] = [];
    course.modules.forEach(module => {
        module.lessons.forEach(lesson => {
            allLessons.push({ lesson, moduleId: module.id });
        });
    });
    
    const currentIndex = allLessons.findIndex(item => item.lesson.id === lessonSlug);

    if (currentIndex === -1) {
        return { prevLesson: null, nextLesson: null };
    }

    const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1].lesson : null;
    const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1].lesson : null;

    return { prevLesson, nextLesson };
}
