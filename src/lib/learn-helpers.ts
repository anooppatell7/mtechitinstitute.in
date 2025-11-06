
import courses from '@/lib/data/courses.json';
import type { LearningCourse, LearningModule, Lesson } from './types';

// Memoization cache
const courseCache = new Map<string, LearningCourse>();

// Pre-fill the cache
courses.forEach(course => {
    courseCache.set(course.id, course as LearningCourse);
});

export async function getCourseData(slug: string): Promise<LearningCourse | null> {
    if (courseCache.has(slug)) {
        return courseCache.get(slug)!;
    }
    // In a real DB-driven app, you'd fetch from the DB here as a fallback
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
