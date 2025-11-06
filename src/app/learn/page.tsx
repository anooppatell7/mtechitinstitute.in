
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowRight } from 'lucide-react';
import type { Metadata } from "next";
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import type { LearningModule } from '@/lib/types';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mtechitinstitute.in";

export const metadata: Metadata = {
  title: "Learn To Code - Interactive Courses | MTech IT Institute",
  description: "Start learning to code with MTech IT Institute. Our interactive courses in HTML, CSS, JavaScript, Python, and more will take you from beginner to pro.",
  keywords: ["learn to code", "interactive coding courses", "learn html", "learn css", "learn javascript", "learn python"],
   alternates: {
    canonical: `${siteUrl}/learn`,
  },
  openGraph: {
    title: "Learn To Code - Interactive Courses | MTech IT Institute",
    description: "Start learning to code with MTech IT Institute. Our interactive courses in HTML, CSS, JavaScript, Python, and more will take you from beginner to pro.",
    url: `${siteUrl}/learn`,
  },
};

// This forces the page to be dynamically rendered
export const revalidate = 0;

async function getLearningModules(): Promise<LearningModule[]> {
    const modulesQuery = query(collection(db, 'learningModules'), orderBy('order'));
    const querySnapshot = await getDocs(modulesQuery);
    return querySnapshot.docs.map(doc => ({ slug: doc.id, ...doc.data() } as LearningModule));
}


export default async function LearnPage() {
    // In the future, progress will come from user data
    const userProgress = {
        html: 0,
        css: 0,
        js: 0,
        python: 0,
        sql: 0,
    } as Record<string, number>;
    
    const learningModules = await getLearningModules();

    return (
        <div className="bg-secondary">
            <div className="container py-16 sm:py-24">
                <div className="text-center mb-12">
                <h1 className="font-headline text-4xl font-bold text-primary sm:text-5xl">Learn with MTech IT</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-primary/80">
                    Start from basics and master real-world skills with interactive lessons and projects.
                </p>
                </div>

                {learningModules.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {learningModules.map((module) => (
                            <Card key={module.slug} className="flex flex-col shadow-sm hover:shadow-lg transition-shadow">
                                <CardHeader className="flex-row items-center gap-4">
                                    <div className="text-4xl">{module.icon}</div>
                                    <div>
                                        <CardTitle className="font-headline text-xl text-primary">{module.title}</CardTitle>
                                        <CardDescription className="line-clamp-2">{module.description}</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <div className="space-y-2">
                                        <Progress value={userProgress[module.slug] || 0} />
                                        <p className="text-xs text-muted-foreground">{userProgress[module.slug] || 0}% Complete</p>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button asChild className="w-full">
                                        <Link href={`/learn/${module.slug}`}>
                                            Start Learning <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <p className="text-lg text-muted-foreground">No learning modules have been added yet.</p>
                            <p className="mt-2 text-sm text-muted-foreground">Admins can add content from the dashboard. Please check back soon!</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
