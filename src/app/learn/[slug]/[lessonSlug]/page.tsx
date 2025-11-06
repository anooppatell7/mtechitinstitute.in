
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Code, BookOpen, BrainCircuit, PencilRuler } from 'lucide-react';
import type { Metadata } from 'next';
import courses from '@/lib/data/courses.json';
import type { LearningCourse, LearningModule, Lesson } from '@/lib/types';
import { getLessonData, getNextPrevLessons } from '@/lib/learn-helpers';


type LessonPageProps = {
  params: {
    slug: string;
    lessonSlug: string;
  };
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mtechitinstitute.in";


export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
    const { course, lesson } = await getLessonData(params.slug, params.lessonSlug);

    if (!course || !lesson) {
        return { title: "Lesson Not Found" };
    }

    return {
        title: `${lesson.title} | ${course.title}`,
        description: `Learn about ${lesson.title} in the ${course.title} course on MTech IT Institute.`,
        alternates: {
            canonical: `${siteUrl}/learn/${params.slug}/${params.lessonSlug}`,
        },
    };
}

export default async function LessonPage({ params }: LessonPageProps) {
    const { course, lesson, module } = await getLessonData(params.slug, params.lessonSlug);

    if (!course || !lesson || !module) {
        notFound();
    }
    
    const { prevLesson, nextLesson } = await getNextPrevLessons(params.slug, module.id, params.lessonSlug);


    return (
        <div className="w-full">
            <div className="mb-8">
                <p className="text-sm text-muted-foreground">
                    <Link href={`/learn/${course.id}`} className="hover:text-accent">{course.title}</Link> &gt; {module.title}
                </p>
                <h1 className="font-headline text-4xl font-bold text-primary sm:text-5xl mt-2">{lesson.title}</h1>
            </div>

            <div className="space-y-8">
                {/* Theory Section */}
                <Card>
                    <CardHeader className="flex flex-row items-center gap-3">
                        <BookOpen className="h-6 w-6 text-accent" />
                        <CardTitle className="font-headline text-2xl text-primary">Theory</CardTitle>
                    </CardHeader>
                    <CardContent className="prose dark:prose-invert max-w-none prose-headings:text-primary prose-p:text-foreground/80 prose-li:text-foreground/80 prose-strong:text-foreground prose-code:bg-muted prose-code:text-primary prose-code:p-1 prose-code:rounded-sm prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-md">
                        <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
                    </CardContent>
                </Card>

                {/* Code Example / Playground Placeholder */}
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
                            <div className="p-8 text-center bg-background border rounded-lg mt-4">
                                <p className="text-muted-foreground">Interactive code editor coming soon!</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Bottom Navigation */}
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
    );
}
