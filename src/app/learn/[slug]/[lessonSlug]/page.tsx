
"use client";

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Code, BookOpen, CheckCircle, Circle } from 'lucide-react';
import { getLessonData, getNextPrevLessons } from '@/lib/learn-helpers';
import { useEffect, useState, use } from 'react';
import { useLearnProgress } from '@/hooks/use-learn-progress';
import { useUser } from '@/firebase';
import type { LearningCourse, LearningModule, Lesson } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

function LessonPageContent({
    course, module, lesson, nextLesson, prevLesson
} : {
    course: LearningCourse,
    module: LearningModule,
    lesson: Lesson,
    nextLesson: Lesson | null,
    prevLesson: Lesson | null
}) {
    const { isLessonCompleted, toggleLessonCompleted } = useLearnProgress();
    const isCompleted = isLessonCompleted(course.id, lesson.id);

    const handleToggleComplete = () => {
        toggleLessonCompleted(course.id, lesson.id);
    }
    
    return (
        <div className="w-full">
            <div className="mb-8">
                <p className="text-sm text-muted-foreground">
                    <Link href={`/learn/${course.id}`} className="hover:text-accent">{course.title}</Link> &gt; {module.title}
                </p>
                <h1 className="font-headline text-4xl font-bold text-primary sm:text-5xl mt-2">{lesson.title}</h1>
            </div>

             <div className="space-y-8">
                <Card>
                    <CardHeader className="flex flex-row items-center gap-3">
                        <BookOpen className="h-6 w-6 text-accent" />
                        <CardTitle className="font-headline text-2xl text-primary">Theory</CardTitle>
                    </CardHeader>
                    <CardContent className="prose dark:prose-invert max-w-none prose-headings:font-headline prose-h2:text-primary prose-a:text-accent prose-p:text-foreground/80 prose-li:text-foreground/80 prose-strong:text-foreground prose-code:bg-muted prose-code:text-primary prose-code:p-1 prose-code:rounded-sm prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-md">
                        <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
                    </CardContent>
                </Card>

                {lesson.exampleCode && (
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-3">
                            <Code className="h-6 w-6 text-accent" />
                            <CardTitle className="font-headline text-2xl text-primary">Code Example</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="p-4 bg-muted rounded-lg text-sm overflow-x-auto">
                                <pre><code>{lesson.exampleCode}</code></pre>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
            
            <div className="mt-8 pt-6 border-t">
                 <Button onClick={handleToggleComplete} variant={isCompleted ? "secondary" : "default"} size="lg">
                    {isCompleted ? <CheckCircle className="mr-2 h-5 w-5"/> : <Circle className="mr-2 h-5 w-5"/>}
                    {isCompleted ? 'Mark as Incomplete' : 'Mark as Complete'}
                </Button>
            </div>

             <div className="mt-12 pt-6 border-t flex justify-between items-center">
                {prevLesson ? (
                    <Button asChild variant="outline">
                        <Link href={`/learn/${course.id}/${prevLesson.id}`}>
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Previous
                        </Link>
                    </Button>
                ) : <div />}
                {nextLesson ? (
                     <Button asChild>
                        <Link href={`/learn/${course.id}/${nextLesson.id}`}>
                            Next
                            <ChevronRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                ) : <div />}
            </div>
        </div>
    )
}

function LessonPageSkeleton() {
    return (
        <div className="w-full animate-pulse">
            <div className="mb-8">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-12 w-3/4 mt-2" />
            </div>
            <div className="space-y-8">
                <Card>
                    <CardHeader><Skeleton className="h-8 w-1/4" /></CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-5/6" />
                        <Skeleton className="h-6 w-full" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function LessonPage({ params }: { params: { slug: string; lessonSlug: string } }) {
    const { slug, lessonSlug } = use(params);
    const { user, isLoading: userLoading } = useUser();
    const router = useRouter();
    const { updateLastVisitedLesson } = useLearnProgress();

    const [lessonData, setLessonData] = useState<{
        course: LearningCourse | null;
        module: LearningModule | null;
        lesson: Lesson | null;
        prevLesson: Lesson | null;
        nextLesson: Lesson | null;
    } | null>(null);
     const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (userLoading) return;
        if (!user) {
            router.push(`/login?redirect=/learn/${slug}/${lessonSlug}`);
            return;
        }

        const fetchLesson = async () => {
            setIsLoading(true);
            const { course, lesson, module } = await getLessonData(slug, lessonSlug);
            
            if (!course || !lesson || !module) {
                // Handle not found, maybe redirect or show a 404 component
                setIsLoading(false);
                return;
            }
            const { prevLesson, nextLesson } = await getNextPrevLessons(slug, module.id, lessonSlug);
            setLessonData({ course, module, lesson, prevLesson, nextLesson });
            updateLastVisitedLesson(slug, lessonSlug);
            setIsLoading(false);
        };
        
        if (slug && lessonSlug) {
            fetchLesson();
        }
    }, [slug, lessonSlug, user, userLoading, router, updateLastVisitedLesson]);
    
    if (isLoading || userLoading || !lessonData) {
        return <LessonPageSkeleton />;
    }

    if (!lessonData.course || !lessonData.lesson || !lessonData.module) {
        // You can return a proper 404 component here
        return <div>Lesson not found.</div>;
    }

    return <LessonPageContent {...lessonData} />;
}
