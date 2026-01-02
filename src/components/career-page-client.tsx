

"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import type { BlogPost } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Skeleton } from "./ui/skeleton";

export default function CareerPageClient() {
  const [guidanceArticles, setGuidanceArticles] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getBlogPostsByCategory(category: string) {
        if (!db) return;
        const blogQuery = query(collection(db, "blog"), where("category", "==", category));
        const blogSnapshot = await getDocs(blogQuery);
        let posts = blogSnapshot.docs.map(doc => ({ slug: doc.id, ...doc.data() } as BlogPost));
        posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setGuidanceArticles(posts);
        setLoading(false);
    }
    getBlogPostsByCategory("Career Guidance");
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  return (
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
  )
}
