
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Code, BookOpen, BrainCircuit, PencilRuler } from 'lucide-react';
import type { Metadata } from 'next';
import courses from '@/lib/data/courses.json';
import type { LearningCourse, Lesson } from '@/lib/types';

type LessonPageProps = {
  params: {
    slug: string;
    lessonSlug: string;
  };
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mtechitinstitute.in";

async function getLessonData(courseSlug: string, lessonSlug: string): Promise<{ course: LearningCourse | null, lesson: Lesson | null }> {
    const allCourses: LearningCourse[] = courses;
    const course = allCourses.find(c => c.id === courseSlug);
    
    if (!course) {
        return { course: null, lesson: null };
    }
    
    for (const module of course.modules) {
        const lesson = module.lessons.find(l => l.id === lessonSlug);
        if (lesson) {
            return { course, lesson };
        }
    }
    
    return { course, lesson: null };
}

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
    const { course, lesson } = await getLessonData(params.slug, params.lessonSlug);

    if (!course || !lesson) {
        notFound();
    }

    return (
        <div className="bg-secondary">
            <div className="container py-16 sm:py-24">
                <div className="mb-8">
                    <Link href={`/learn/${course.id}`} className="flex items-center text-sm text-accent hover:underline mb-6">
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Back to {course.title}
                    </Link>
                    <h1 className="font-headline text-4xl font-bold text-primary sm:text-5xl">{lesson.title}</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-8">
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

                    <aside className="lg:col-span-1 space-y-8">
                        {/* Practice Tasks Placeholder */}
                        {lesson.practiceTask && (
                        <Card>
                             <CardHeader className="flex flex-row items-center gap-3">
                                <PencilRuler className="h-6 w-6 text-accent" />
                                <CardTitle className="font-headline text-xl text-primary">Practice Task</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-foreground/80">{lesson.practiceTask}</p>
                                <p className="text-sm text-muted-foreground mt-4">Interactive tasks coming soon!</p>
                            </CardContent>
                        </Card>
                        )}
                        
                        {/* Quiz Placeholder */}
                        {lesson.quiz && (
                        <Card>
                             <CardHeader className="flex flex-row items-center gap-3">
                                <BrainCircuit className="h-6 w-6 text-accent" />
                                <CardTitle className="font-headline text-xl text-primary">Quiz</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">A short quiz to check your understanding will be available here soon.</p>
                                <Button disabled className="w-full mt-4">Start Quiz</Button>
                            </CardContent>
                        </Card>
                        )}
                    </aside>
                </div>
            </div>
        </div>
    );
}
