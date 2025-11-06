
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { learningModules } from '@/lib/learn-data';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Code, BookOpen, BrainCircuit, PencilRuler } from 'lucide-react';
import type { Metadata } from 'next';

type LessonPageProps = {
  params: {
    slug: string;
    lessonSlug: string;
  };
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mtechitinstitute.in";

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
    const module = learningModules.find(m => m.slug === params.slug);
    const lesson = module?.chapters.flatMap(c => c.lessons).find(l => l.slug === params.lessonSlug);

    if (!module || !lesson) {
        return { title: "Lesson Not Found" };
    }

    return {
        title: `${lesson.title} | ${module.title}`,
        description: `Learn about ${lesson.title} in the ${module.title} course on MTech IT Institute.`,
        alternates: {
            canonical: `${siteUrl}/learn/${params.slug}/${params.lessonSlug}`,
        },
    };
}


export default function LessonPage({ params }: LessonPageProps) {
    const module = learningModules.find(m => m.slug === params.slug);
    const lesson = module?.chapters.flatMap(c => c.lessons).find(l => l.slug === params.lessonSlug);

    if (!module || !lesson) {
        notFound();
    }

    return (
        <div className="bg-secondary">
            <div className="container py-16 sm:py-24">
                <div className="mb-8">
                    <Link href={`/learn/${module.slug}`} className="flex items-center text-sm text-accent hover:underline mb-6">
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Back to {module.title}
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
                            <CardContent className="prose dark:prose-invert max-w-none">
                                <div dangerouslySetInnerHTML={{ __html: lesson.theory }} />
                            </CardContent>
                        </Card>

                        {/* Code Example / Playground Placeholder */}
                        <Card>
                             <CardHeader className="flex flex-row items-center gap-3">
                                <Code className="h-6 w-6 text-accent" />
                                <CardTitle className="font-headline text-2xl text-primary">Code Playground</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="p-8 text-center bg-muted rounded-lg">
                                    <p className="text-muted-foreground">Interactive code editor coming soon!</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <aside className="lg:col-span-1 space-y-8">
                        {/* Practice Tasks Placeholder */}
                        <Card>
                             <CardHeader className="flex flex-row items-center gap-3">
                                <PencilRuler className="h-6 w-6 text-accent" />
                                <CardTitle className="font-headline text-xl text-primary">Practice Tasks</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">Practice tasks for this lesson will appear here. Get ready to test your skills!</p>
                            </CardContent>
                        </Card>
                        
                        {/* Quiz Placeholder */}
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
                    </aside>
                </div>
            </div>
        </div>
    );
}
