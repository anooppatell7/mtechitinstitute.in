

"use client";

import { notFound, useParams } from "next/navigation";
import BlogCard from "@/components/blog-card";
import { Metadata } from "next";
import SectionDivider from "@/components/section-divider";
import { useEffect, useState } from "react";
import { BlogPost } from "@/lib/types";
import { db } from "@/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

type TagPageProps = {
  params: {
    tag: string;
  };
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mtechitinstitute.in";


export default function TagPage({ params }: TagPageProps) {
  const tagName = decodeURIComponent(params.tag);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getPostsByTag(tag: string) {
        if (!db) return;
        const q = query(collection(db, "blog"), where("tags", "array-contains", tag));
        const querySnapshot = await getDocs(q);
        const postList = querySnapshot.docs.map(doc => {
             const data = doc.data() as Omit<BlogPost, 'slug' | 'summary'>;
            const snippet = data.content.replace(/<[^>]+>/g, '').substring(0, 150);
            return { 
                ...data, 
                slug: doc.id,
                summary: `${snippet}...` 
            } as BlogPost;
        });
        postList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setPosts(postList);
        setLoading(false);
    }
    getPostsByTag(tagName);
  }, [tagName]);

  if (loading) {
    return <div>Loading...</div>
  }

  if (posts.length === 0) {
    notFound();
  }

  const metadata: Metadata = {
    title: `Posts tagged with "${tagName}" - MTech IT Institute`,
    description: `Browse blog posts and articles tagged with "${tagName}" on the MTech IT Institute blog.`,
    alternates: {
      canonical: `${siteUrl}/blog/tag/${params.tag}`,
    },
  };

  return (
    <>
      <head>
          <title>{metadata.title as string}</title>
          <meta name="description" content={metadata.description as string} />
      </head>
      <div className="bg-gradient-to-br from-indigo-600 via-blue-500 to-cyan-400 text-white">
        <div className="container py-16 sm:py-24 text-center">
          <h1 className="font-headline text-4xl font-bold sm:text-5xl">
            Blog Posts Tagged: <span className="text-green-300">{tagName}</span>
          </h1>
        </div>
      </div>

      <div className="bg-secondary relative">
        <SectionDivider style="wave" className="text-gradient-to-br from-indigo-600 via-blue-500 to-cyan-400" position="top"/>
        <div className="container py-16 sm:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
