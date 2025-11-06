
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import type { LearningModule, Chapter, Lesson } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ChevronLeft } from 'lucide-react';
import type { Metadata } from 'next';

type LearnModulePageProps = {
  params: {
    slug: string;
  };
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mtechitinstitute.in";

async function getModule(slug: string): Promise<LearningModule | null> {
    const docRef = doc(db, 'learningModules', slug);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        return null;
    }
    
    const moduleData = docSnap.data();
    const chaptersQuery = query(collection(db, 'learningModules', slug, 'chapters'), orderBy('order'));
    const chaptersSnap = await getDocs(chaptersQuery);

    const chapters: Chapter[] = [];
    for (const chapterDoc of chaptersSnap.docs) {
        const chapterData = chapterDoc.data();
        const lessonsQuery = query(collection(db, 'learningModules', slug, 'chapters', chapterDoc.id, 'lessons'), orderBy('order'));
        const lessonsSnap = await getDocs(lessonsQuery);
        const lessons = lessonsSnap.docs.map(lessonDoc => ({ slug: lessonDoc.id, ...lessonDoc.data() } as Lesson));

        chapters.push({
            slug: chapterDoc.id,
            title: chapterData.title,
            order: chapterData.order,
            lessons: lessons,
        });
    }

    return {
        slug: docSnap.id,
        title: moduleData.title,
        description: moduleData.description,
        difficulty: moduleData.difficulty,
        icon: moduleData.icon,
        order: moduleData.order,
        chapters,
    } as LearningModule;
}


export async function generateMetadata({ params }: LearnModulePageProps): Promise<Metadata> {
  const module = await getModule(params.slug);
  if (!module) {
    return { title: "Module Not Found" };
  }
  return {
    title: `${module.title} | MTech IT Institute`,
    description: `Start learning ${module.title}. ${module.description}`,
     alternates: {
      canonical: `${siteUrl}/learn/${params.slug}`,
    },
  };
}

export default async function LearnModulePage({ params }: LearnModulePageProps) {
  const module = await getModule(params.slug);

  if (!module) {
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
                 <h1 className="font-headline text-4xl font-bold text-primary sm:text-5xl">{module.title}</h1>
                 <p className="mt-2 max-w-2xl text-lg text-foreground/80">{module.description}</p>
            </div>
            <Badge variant="outline" className="mt-4 sm:mt-0 text-base">{module.difficulty}</Badge>
          </div>
        </div>

        <div className="space-y-8">
            {module.chapters.map((chapter) => (
                <Card key={chapter.slug} className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl text-primary">{chapter.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {chapter.lessons.map((lesson) => (
                                <li key={lesson.slug}>
                                    <Link href={`/learn/${module.slug}/${lesson.slug}`} className="flex items-center gap-3 p-3 -m-3 rounded-md hover:bg-secondary transition-colors">
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
            {module.chapters.length === 0 && (
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
