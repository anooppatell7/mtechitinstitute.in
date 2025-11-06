
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, ChevronLeft, Layers, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import { getCourseData } from '@/lib/learn-helpers';
import type { LearningModule } from '@/lib/types';

type LearnModulePageProps = {
  params: {
    slug: string;
  };
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mtechitinstitute.in";


export async function generateMetadata({ params }: LearnModulePageProps): Promise<Metadata> {
  const course = await getCourseData(params.slug);
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

const getFirstLesson = (module: LearningModule) => {
    return module.lessons && module.lessons.length > 0 ? module.lessons[0] : null;
}

export default async function LearnModulePage({ params }: LearnModulePageProps) {
  const course = await getCourseData(params.slug);

  if (!course) {
    notFound();
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
                        <p>Lessons for this course are coming soon. Check back later!</p>
                    </CardContent>
                </Card>
            )}
        </div>
      </div>
  );
}
