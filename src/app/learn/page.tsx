
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowRight } from 'lucide-react';
import { useLearnProgress } from '@/hooks/use-learn-progress';
import { useUser } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { getAllCourses } from '@/lib/learn-helpers';
import type { LearningCourse } from '@/lib/types';

function LearnPageUnauthenticated() {
    return (
        <div className="text-center mb-12">
            <h1 className="font-headline text-4xl font-bold text-primary sm:text-5xl">Start Your Learning Journey</h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-primary/80">
                Create an account or log in to access our interactive courses and track your progress.
            </p>
            <div className="mt-8 flex justify-center gap-4">
                <Button asChild size="lg">
                    <Link href="/login">Login</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                    <Link href="/signup">Sign Up</Link>
                </Button>
            </div>
        </div>
    )
}

function LearnPageAuthenticated({ courses }: { courses: LearningCourse[] }) {
    const { getCourseProgress } = useLearnProgress();
    
    // Sort courses by the 'order' property
    const learningCourses: LearningCourse[] = [...courses].sort((a, b) => a.order - b.order);

    return (
        <>
            <div className="text-center mb-12">
                <h1 className="font-headline text-4xl font-bold text-primary sm:text-5xl">Learn. Code. Grow with MTech IT</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-primary/80">
                    Turn your curiosity into skill — start learning today with interactive modules.
                </p>
            </div>

            {learningCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {learningCourses.map((course) => {
                        const { progressPercentage } = getCourseProgress(course);

                        return (
                            <Card key={course.id} className="flex flex-col shadow-sm hover:shadow-lg transition-shadow">
                                <CardHeader className="flex-row items-center gap-4">
                                    <div className="text-4xl">{course.icon || '📚'}</div>
                                    <div>
                                        <CardTitle className="font-headline text-xl text-primary">{course.title}</CardTitle>
                                        <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <div className="space-y-2">
                                        <Progress value={progressPercentage} />
                                        <p className="text-xs text-muted-foreground">{Math.round(progressPercentage)}% Complete</p>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button asChild className="w-full">
                                        <Link href={`/learn/${course.id}`}>
                                            Start Learning <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <Card>
                    <CardContent className="p-12 text-center">
                        <p className="text-lg text-muted-foreground">No learning modules have been added yet.</p>
                        <p className="mt-2 text-sm text-muted-foreground">Admins can add content from the dashboard. Please check back soon!</p>
                    </CardContent>
                </Card>
            )}
        </>
    );
}

export default function LearnPage() {
    const { user, isLoading: userLoading } = useUser();
    const [courses, setCourses] = useState<LearningCourse[]>([]);
    const [dataLoading, setDataLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            setDataLoading(true);
            const courseList = await getAllCourses();
            setCourses(courseList);
            setDataLoading(false);
        };

        fetchCourses();
    }, []);

    if (userLoading || dataLoading) {
        return (
            <div className="bg-secondary">
                <div className="container py-16 sm:py-24">
                     <div className="text-center mb-12">
                        <Skeleton className="h-10 w-3/4 mx-auto" />
                        <Skeleton className="h-6 w-1/2 mx-auto mt-4" />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {Array.from({length: 3}).map((_, i) => (
                             <Card key={i}>
                                <CardHeader><Skeleton className="h-8 w-3/4" /></CardHeader>
                                <CardContent><Skeleton className="h-10 w-full" /></CardContent>
                                <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
                             </Card>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-secondary">
            <div className="container py-16 sm:py-24">
                {user ? <LearnPageAuthenticated courses={courses} /> : <LearnPageUnauthenticated />}
            </div>
        </div>
    )
}
