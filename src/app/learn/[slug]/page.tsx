
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ChevronLeft } from 'lucide-react';
import type { Metadata } from 'next';
import courses from '@/lib/data/courses.json';
import type { LearningCourse, LearningModule, Lesson } from '@/lib/types';

type LearnModulePageProps = {
  params: {
    slug: string;
  };
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mtechitinstitute.in";

async function getModule(slug: string): Promise<LearningCourse | null> {
    const allCourses: LearningCourse[] = courses;
    const course = allCourses.find(c => c.id === slug);
    return course || null;
}

export async function generateMetadata({ params }: LearnModulePageProps): Promise<Metadata> {
  const course = await getModule(params.slug);
  if (!course) {
    return { title: "Course Not Found" };
  }
  return {
    title: `${course.title} | MTech IT Institute`,
    description: `Start learning ${course.title}. ${course.description}`,
     alternates: {
      canonical: `${siteUrl}/learn/${params.slug}`,
    },
  };
}

export default async function LearnModulePage({ params }: LearnModulePageProps) {
  const course = await getModule(params.slug);

  if (!course) {
    notFound();
  }

  return (
    <div className="bg-background">
      <div className="container py-16 sm:py-24">
        <div className="mb-12">
            <Link href="/learn" className="flex items-center text-sm text-accent hover:underline mb-4">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Learn
            </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
                 <h1 className="font-headline text-4xl font-bold text-primary sm:text-5xl">{course.title}</h1>
                 <p className="mt-2 max-w-2xl text-lg text-foreground/80">{course.description}</p>
            </div>
            <Badge variant="outline" className="mt-4 sm:mt-0 text-base">{course.level}</Badge>
          </div>
        </div>

        <div className="space-y-8">
            {course.modules.map((module) => (
                <Card key={module.id} className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl text-primary">{module.title}</CardTitle>
                        <Badge variant="secondary" className="w-fit">{module.difficulty}</Badge>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {module.lessons.map((lesson) => (
                                <li key={lesson.id}>
                                    <Link href={`/learn/${course.id}/${lesson.id}`} className="flex items-center gap-3 p-3 -m-3 rounded-md hover:bg-secondary transition-colors">
                                        <div className="p-2 bg-primary/10 text-accent rounded-md">
                                            <BookOpen className="h-5 w-5" />
                                        </div>
                                        <span className="font-medium text-primary/90">{lesson.title}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            ))}
            {course.modules.length === 0 && (
                <Card>
                    <CardContent className="p-12 text-center text-muted-foreground">
                        <p>Lessons for this module are coming soon. Check back later!</p>
                    </CardContent>
                </Card>
            )}
        </div>
      </div>
    </div>
  );
}
