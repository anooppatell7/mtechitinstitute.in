
import LearnSidebar from "@/components/learn/sidebar";

export default function LearnCourseLayout({ 
    children,
    params 
}: { 
    children: React.ReactNode,
    params: { slug: string }
}) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <LearnSidebar courseSlug={params.slug} />
      <main className="flex-1 bg-secondary/50 dark:bg-background p-6 sm:p-8 md:p-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
