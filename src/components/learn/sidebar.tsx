
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X, BookText, Layers, Search as SearchIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import courses from '@/lib/data/courses.json';
import type { LearningCourse, LearningModule, Lesson } from '@/lib/types';
import Logo from '../logo';
import { Input } from '../ui/input';

type SidebarProps = {
  courseSlug: string;
};

export default function LearnSidebar({ courseSlug }: SidebarProps) {
  const [course, setCourse] = useState<LearningCourse | null>(null);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const pathname = usePathname();

  useEffect(() => {
    const currentCourse = courses.find(c => c.id === courseSlug);
    setCourse(currentCourse || null);
  }, [courseSlug]);

  const filteredModules = course?.modules.map(module => {
    const filteredLessons = module.lessons.filter(lesson =>
      lesson.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return { ...module, lessons: filteredLessons };
  }).filter(module => module.lessons.length > 0 || module.title.toLowerCase().includes(searchTerm.toLowerCase()));


  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-card text-card-foreground border-r">
       <div className="p-4 border-b">
         <Link href="/learn">
          <Logo />
        </Link>
      </div>

       <div className="p-4 border-b">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter lessons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Accordion
          type="multiple"
          defaultValue={course?.modules.map(m => m.id)}
          className="w-full"
        >
          {filteredModules?.map((module: LearningModule) => (
            <AccordionItem value={module.id} key={module.id}>
              <AccordionTrigger className="px-4 py-3 text-base hover:no-underline hover:bg-accent/5">
                 <div className="flex items-center gap-3">
                    <Layers className="h-5 w-5 text-accent" />
                    <span className="font-semibold text-primary/90">{module.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-0">
                <ul className="space-y-1 border-l-2 border-accent/20 ml-6 pl-2">
                  {module.lessons.map((lesson: Lesson) => {
                    const isActive = pathname === `/learn/${courseSlug}/${lesson.id}`;
                    return (
                      <li key={lesson.id}>
                        <Link
                          href={`/learn/${courseSlug}/${lesson.id}`}
                          onClick={() => setOpen(false)}
                          className={cn(
                            'flex items-center gap-3 p-2 rounded-md transition-colors text-sm w-full text-left',
                            isActive
                              ? 'bg-accent text-accent-foreground'
                              : 'hover:bg-accent/10 text-muted-foreground'
                          )}
                        >
                          <BookText className="h-4 w-4" />
                          <span>{lesson.title}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
       <div className="p-4 border-t">
          <Button variant="outline" className="w-full" asChild>
            <Link href="/learn">All Courses</Link>
          </Button>
       </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar (Drawer) */}
      <div className="md:hidden sticky top-16 bg-card border-b z-10 p-2 flex items-center">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm">
              <Menu className="h-5 w-5 mr-2" />
              Menu
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-80">
             <SheetHeader className="sr-only">
                <SheetTitle>Course Navigation</SheetTitle>
            </SheetHeader>
            <SidebarContent />
          </SheetContent>
        </Sheet>
        <div className="text-sm font-semibold truncate ml-4">{course?.title}</div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-80 sticky top-16 h-[calc(100vh-4rem)]">
        <SidebarContent />
      </aside>
    </>
  );
}
