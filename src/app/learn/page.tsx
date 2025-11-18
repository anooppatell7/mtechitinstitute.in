
"use client";

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, Search, X } from 'lucide-react';
import { useLearnProgress } from '@/hooks/use-learn-progress';
import { useUser } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { getAllCourses } from '@/lib/learn-helpers';
import type { LearningCourse } from '@/lib/types';
import { Input } from '@/components/ui/input';
import SectionDivider from '@/components/section-divider';

function LearnPageUnauthenticated() {
    return (
        <div className="bg-background">
            <div className="container py-16 sm:py-24 text-center">
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
        </div>
    )
}

function LearnPageAuthenticated({ courses }: { courses: LearningCourse[] }) {
    const { getCourseProgress } = useLearnProgress();
    const [searchTerm, setSearchTerm] = useState('');
    
    const filteredCourses = useMemo(() => {
        if (!searchTerm) {
            return courses;
        }
        return courses.filter(course =>
            course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [courses, searchTerm]);

    // Sort courses by the 'order' property
    const learningCourses: LearningCourse[] = [...filteredCourses].sort((a, b) => a.order - b.order);

    return (
        <>
             <div className="bg-secondary relative">
                <div className="container py-16 sm:py-24">
                    <div className="text-center mb-12">
                        <h1 className="font-headline text-4xl font-bold text-primary sm:text-5xl">Learn<span className="text-accent">.</span> Code<span className="text-accent">.</span> Grow<span className="text-accent">.</span></h1>
                        <p className="mt-4 max-w-2xl mx-auto text-lg text-primary/80">
                            Turn your curiosity into skill — start learning today with interactive modules.
                        </p>
                    </div>
                     <div className="mb-12 max-w-lg mx-auto relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search courses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 text-base focus-visible:ring-accent"
                        />
                        {searchTerm && (
                            <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setSearchTerm('')}>
                               <X className="h-5 w-5" />
                            </Button>
                        )}
                    </div>

                    {learningCourses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {learningCourses.map((course) => {
                                const { progressPercentage } = getCourseProgress(course);

                                return (
                                    <Card key={course.id} className="flex flex-col shadow-sm hover:shadow-lg transition-shadow bg-background">
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
                                <p className="text-lg text-muted-foreground">No courses found matching your search.</p>
                                <p className="mt-2 text-sm text-muted-foreground">Try a different keyword or browse all available courses.</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
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

    const isLoading = userLoading || dataLoading;

    if (isLoading) {
        return (
            <div className="container py-16 sm:py-24">
                 <div className="text-center mb-12">
                      <Skeleton className="h-10 w-3/4 mx-auto" />
                      <Skeleton className="h-6 w-1/2 mx-auto mt-4" />
                  </div>
                   <div className="mb-12 max-w-lg mx-auto">
                      <Skeleton className="h-12 w-full" />
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
        )
    }

    if (!user) {
        return <LearnPageUnauthenticated />;
    }

    return <LearnPageAuthenticated courses={courses} />
}
