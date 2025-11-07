
"use client";

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Layers, ArrowRight, BookOpen } from 'lucide-react';
import type { LearningCourse, LearningModule } from '@/lib/types';
import { getCourseData } from '@/lib/learn-helpers';
import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { useLearnProgress } from '@/hooks/use-learn-progress';

const getFirstLesson = (module: LearningModule) => {
    return module.lessons && module.lessons.length > 0 ? module.lessons[0] : null;
}

export default function LearnModulePage({ params }: { params: { slug: string } }) {
  const [course, setCourse] = useState<LearningCourse | null>(null);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const { getCourseProgress } = useLearnProgress();

  useEffect(() => {
    async function loadData() {
        const courseData = await getCourseData(params.slug);
        setCourse(courseData);
    }
    
    if (params.slug) {
        loadData();
        const { progressPercentage: newProgress } = getCourseProgress(params.slug);
        setProgressPercentage(newProgress);
    }
    
  }, [params.slug, getCourseProgress]);


  if (!course) {
    // TODO: Add a skeleton loader here
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full">
        <div className="mb-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="font-headline text-4xl font-bold text-primary sm:text-5xl">{course.title}</h1>
                    <p className="mt-2 max-w-2xl text-lg text-foreground/80">{course.description}</p>
                </div>
                <Badge variant="outline" className="mt-4 sm:mt-0 text-base">{course.level}</Badge>
            </div>
            <div className="mt-6">
                <Progress value={progressPercentage} className="h-2" />
                <p className="text-sm text-muted-foreground mt-2">{Math.round(progressPercentage)}% Complete</p>
            </div>
        </div>

        <div className="space-y-8">
            {course.modules.map((module) => {
                const firstLesson = getFirstLesson(module);
                return (
                    <Card key={module.id} className="shadow-sm transition-shadow hover:shadow-md">
                         <CardHeader className="flex flex-row items-start justify-between gap-4">
                            <div>
                                <CardTitle className="font-headline text-2xl text-primary">{module.title}</CardTitle>
                                <Badge variant="secondary" className="mt-2">{module.difficulty}</Badge>
                            </div>
                             <div className="p-3 bg-primary/10 text-accent rounded-md">
                                <Layers className="h-6 w-6" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{module.lessons.map(l => l.title).join(', ')}</p>
                        </CardContent>
                         <CardFooter>
                           {firstLesson ? (
                             <Button asChild>
                                <Link href={`/learn/${course.id}/${firstLesson.id}`}>
                                    Start Chapter <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                           ) : (
                             <Button disabled>Coming Soon</Button>
                           )}
                        </CardFooter>
                    </Card>
                );
            })}
            {course.modules.length === 0 && (
                <Card>
                    <CardContent className="p-12 text-center text-muted-foreground">
                         <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-4 text-lg">Lessons are on the way!</p>
                        <p className="mt-2 text-sm">Content for this course is being prepared. Please check back soon.</p>
                    </CardContent>
                </Card>
            )}
        </div>
      </div>
  );
}
