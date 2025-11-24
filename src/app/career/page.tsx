
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Lightbulb, TrendingUp } from "lucide-react";
import Link from "next/link";
import { getBlogPostsByCategory } from "@/lib/firebase";
import type { BlogPost } from "@/lib/types";
import type { Metadata } from "next";
import SectionDivider from "@/components/section-divider";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mtechitinstitute.in";

export const metadata: Metadata = {
  title: "Career Guidance After 12th & For IT Professionals",
  description: "Get expert career guidance after 12th. Explore top IT jobs, necessary skills, and career growth strategies in the technology sector with MTech IT Institute.",
  keywords: ["career guidance after 12th", "IT jobs", "career in IT", "skill development", "freelancing jobs"],
  alternates: {
    canonical: `${siteUrl}/career`,
  },
  openGraph: {
    title: "Career Guidance After 12th & For IT Professionals",
    description: "Get expert career guidance after 12th. Explore top IT jobs, necessary skills, and career growth strategies in the technology sector.",
    url: `${siteUrl}/career`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Career Guidance After 12th & For IT Professionals",
    description: "Get expert career guidance after 12th. Explore top IT jobs, necessary skills, and career growth strategies in the technology sector.",
  },
};

// This forces the page to be dynamically rendered
export const revalidate = 0;

export default async function CareerPage() {
  const guidanceArticles = await getBlogPostsByCategory("Career Guidance");

  return (
    <>
      <div className="bg-gradient-to-br from-indigo-600 via-blue-500 to-cyan-400 text-white">
        <div className="container py-16 sm:py-24 text-center">
          <h1 className="font-headline text-4xl font-bold sm:text-5xl">Career Guidance<span className="text-green-300">.</span></h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-blue-50">
            Let us help you navigate your career path in the world of technology, whether you're a student or a professional.
          </p>
        </div>
      </div>

      <div className="bg-secondary relative">
        <SectionDivider style="wave" className="text-gradient-to-br from-indigo-600 via-blue-500 to-cyan-400" position="top"/>
        <div className="container py-16 sm:py-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <Card className="text-center border-t-4 border-t-accent">
                  <CardHeader>
                      <div className="flex justify-center mb-4"><Briefcase className="h-10 w-10 text-accent" /></div>
                      <CardTitle className="font-headline text-xl text-primary">Explore IT Jobs</CardTitle>
                      <CardDescription className="pt-2">Understand the various roles and opportunities available in the IT sector after the 12th grade.</CardDescription>
                  </CardHeader>
              </Card>
              <Card className="text-center border-t-4 border-t-accent">
                  <CardHeader>
                      <div className="flex justify-center mb-4"><Lightbulb className="h-10 w-10 text-accent" /></div>
                      <CardTitle className="font-headline text-xl text-primary">Skill Development</CardTitle>
                      <CardDescription className="pt-2">Learn which skills are in demand for coding, marketing, and design jobs, and how to acquire them.</CardDescription>
                  </CardHeader>
              </Card>
              <Card className="text-center border-t-4 border-t-accent">
                  <CardHeader>
                      <div className="flex justify-center mb-4"><TrendingUp className="h-10 w-10 text-accent" /></div>
                      <CardTitle className="font-headline text-xl text-primary">Career Growth</CardTitle>
                      <CardDescription className="pt-2">Get insights on how to grow in your career, from landing your first internship to leadership roles.</CardDescription>
                  </CardHeader>
              </Card>
          </div>

          <div>
              <h2 className="font-headline text-3xl font-bold text-primary mb-8 text-center">Guidance Articles</h2>
              <div className="space-y-6">
                  {guidanceArticles.length > 0 ? (
                      guidanceArticles.map((article) => (
                          <Card key={article.slug} className="shadow-sm hover:shadow-md transition-shadow bg-background border-t-4 border-t-accent">
                              <CardContent className="p-6">
                                  <h3 className="font-headline text-xl text-primary mb-2">
                                      <Link href={`/blog/${article.slug}`} className="hover:text-accent transition-colors">
                                          {article.title}
                                      </Link>
                                  </h3>
                                  <p className="text-foreground/80 line-clamp-2">{article.content.replace(/<[^>]+>/g, '')}</p>
                              </CardContent>
                          </Card>
                      ))
                  ) : (
                      <Card className="bg-background">
                          <CardContent className="p-6 text-center text-muted-foreground">
                              <p>No guidance articles have been added yet. Check back soon!</p>
                          </CardContent>
                      </Card>
                  )}
              </div>
          </div>
        </div>
      </div>
    </>
  );
}
