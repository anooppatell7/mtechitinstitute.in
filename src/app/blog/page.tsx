
"use client";

import { useState, useMemo, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import type { BlogPost } from "@/lib/types";
import BlogCard from "@/components/blog-card";
import AdPlaceholder from "@/components/ad-placeholder";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Search } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import SectionDivider from "@/components/section-divider";


export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [popularTags, setPopularTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function getBlogData() {
      try {
        const blogQuery = query(collection(db, "blog"), orderBy("date", "desc"));
        const blogSnapshot = await getDocs(blogQuery);
        
        const fetchedPosts = blogSnapshot.docs.map(doc => {
            const data = doc.data() as Omit<BlogPost, 'slug' | 'summary'>;
            const summary = data.content.replace(/<[^>]+>/g, '').substring(0, 150) + '...';
            return { slug: doc.id, ...data, summary } as BlogPost;
        });
    
        const tagCounts = fetchedPosts.reduce((acc, post) => {
            (post.tags || []).forEach(tag => {
                acc[tag] = (acc[tag] || 0) + 1;
            });
            return acc;
        }, {} as Record<string, number>);
    
        const sortedTags = Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(entry => entry[0]);

        setPosts(fetchedPosts);
        setPopularTags(sortedTags);

      } catch (error) {
        console.error("Failed to fetch blog data:", error);
      } finally {
        setLoading(false);
      }
    }
    getBlogData();
  }, []);

  const filteredPosts = useMemo(() => {
    if (!searchTerm) {
      return posts;
    }
    return posts.filter(post =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.summary?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [posts, searchTerm]);

  return (
    <>
      <div className="bg-background">
        <div className="container py-16 sm:py-24 text-center">
          <h1 className="font-headline text-4xl font-bold text-primary sm:text-5xl">Our Tech Blog</h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-primary/80">
            Find insights, tutorials, and career advice from our IT experts. Stay updated with the latest trends in technology.
          </p>
        </div>
      </div>

      <div className="bg-secondary relative">
        <SectionDivider style="wave" className="text-background" position="top"/>
        <div className="container py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
              <main className="lg:col-span-3">
                  <div className="mb-8 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                          type="text"
                          placeholder="Search articles..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 text-base"
                      />
                      {searchTerm && (
                          <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setSearchTerm('')}>
                             <X className="h-5 w-5" />
                          </Button>
                      )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {loading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                          <Card key={i}>
                            <Skeleton className="h-56 w-full" />
                            <CardContent className="p-6 space-y-4">
                              <Skeleton className="h-4 w-1/2" />
                              <Skeleton className="h-6 w-full" />
                              <Skeleton className="h-12 w-full" />
                            </CardContent>
                          </Card>
                        ))
                      ) : filteredPosts && filteredPosts.length > 0 ? (
                        filteredPosts.map((post) => (
                            <BlogCard key={post.slug} post={post} />
                        ))
                      ) : (
                         <div className="md:col-span-2 text-center py-12">
                            <p className="text-lg text-muted-foreground">No articles found matching your search.</p>
                         </div>
                      )}
                  </div>
              </main>
              <aside className="lg:col-span-1 space-y-8">
                  <div className="p-6 bg-background rounded-lg shadow-sm">
                      <h3 className="font-headline text-lg font-semibold text-primary mb-4">Popular Tags</h3>
                       {loading ? (
                        <div className="flex flex-wrap gap-2">
                          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-6 w-16 rounded-full" />)}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                            {popularTags && popularTags.map(tag => (
                                <Link href={`/blog/tag/${tag}`} key={tag}>
                                    <Badge variant="outline">{tag}</Badge>
                                </Link>
                            ))}
                        </div>
                      )}
                  </div>
                  <AdPlaceholder />
              </aside>
          </div>
        </div>
      </div>
    </>
  );
}
