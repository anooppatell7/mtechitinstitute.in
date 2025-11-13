
import { notFound } from "next/navigation";
import { getPostsByTag } from "@/lib/firebase";
import BlogCard from "@/components/blog-card";
import { Metadata } from "next";
import SectionDivider from "@/components/section-divider";

type TagPageProps = {
  params: {
    tag: string;
  };
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mtechitinstitute.in";

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const tagName = decodeURIComponent(params.tag);
  return {
    title: `Posts tagged with "${tagName}" - MTech IT Institute`,
    description: `Browse blog posts and articles tagged with "${tagName}" on the MTech IT Institute blog.`,
    alternates: {
      canonical: `${siteUrl}/blog/tag/${params.tag}`,
    },
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const tagName = decodeURIComponent(params.tag);
  const posts = await getPostsByTag(tagName);

  if (posts.length === 0) {
    notFound();
  }

  return (
    <>
      <div className="bg-background">
        <div className="container py-16 sm:py-24 text-center">
          <h1 className="font-headline text-4xl font-bold text-primary sm:text-5xl">
            Blog Posts Tagged: <span className="text-accent">{tagName}</span>
          </h1>
        </div>
      </div>

      <div className="bg-secondary relative">
        <SectionDivider style="wave" className="text-background" position="top"/>
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
