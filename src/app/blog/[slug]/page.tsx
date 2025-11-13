
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Calendar, User, Tag } from "lucide-react";
import AdPlaceholder from "@/components/ad-placeholder";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import type { BlogPost, InternalLink } from "@/lib/types";
import type { Metadata } from 'next';
import { JsonLd } from "@/components/json-ld";
import { generatePostSchema, breadcrumbSchema } from "@/lib/schema-generator";
import ShareButtons from "@/components/share-buttons";

type BlogPostPageProps = {
  params: {
    slug: string;
  };
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mtechitinstitute.in";

// This forces the page to be dynamically rendered, ensuring data is always fresh
export const revalidate = 0;

// This allows Next.js to know which slugs are available at build time
export async function generateStaticParams() {
  const blogSnapshot = await getDocs(collection(db, "blog"));
  return blogSnapshot.docs.map((doc) => ({
    slug: doc.id,
  }));
}

async function getPost(slug: string): Promise<BlogPost | null> {
    const docRef = doc(db, "blog", slug);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        return null;
    }
    return { slug: docSnap.id, ...docSnap.data() } as BlogPost;
}


export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await getPost(params.slug);

  if (!post) {
    return {
      title: "Post Not Found",
      description: "The article you are looking for does not exist.",
    };
  }
  
  const postDescription = post.content.substring(0, 160).replace(/<[^>]+>/g, '');

  return {
    title: post.title,
    description: postDescription,
    keywords: post.tags,
    alternates: {
      canonical: `${siteUrl}/blog/${params.slug}`,
    },
    openGraph: {
      title: post.title,
      description: postDescription,
      url: `${siteUrl}/blog/${params.slug}`,
      type: 'article',
      article: {
        publishedTime: new Date(post.date).toISOString(),
        authors: [post.author],
        tags: post.tags,
        section: post.category,
      },
      images: [
        {
          url: post.image,
          width: 1200,
          height: 630,
          alt: post.title,
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: postDescription,
      images: [post.image],
    },
  };
}

// Function to apply internal links to content
function applyInternalLinks(content: string, links: InternalLink[] = []): string {
  let linkedContent = content;
  if (links.length > 0) {
    links.forEach(link => {
      // Use a more specific regex to avoid linking inside HTML tags
      const regex = new RegExp(`(?<!<[^>]*)\\b(${link.keyword})\\b(?![^<]*>)`, 'gi');
      linkedContent = linkedContent.replace(regex, (match) => 
        `<a href="${link.url}" title="${link.title}" rel="internal" class="text-accent hover:underline">${match}</a>`
      );
    });
  }
  return linkedContent;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getPost(params.slug);

  if (!post) {
    notFound();
  }
  
  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Blog", href: "/blog" },
    { name: post.title, href: `/blog/${post.slug}` },
  ];
  
  const finalContent = applyInternalLinks(post.content, post.internalLinks);
  const postSchema = generatePostSchema(post);

  return (
    <>
      <JsonLd data={postSchema} />
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />
      <div className="bg-secondary">
        <div className="container py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
              <article className="lg:col-span-3 prose prose-lg max-w-none dark:prose-invert prose-headings:font-headline prose-headings:text-primary prose-a:text-accent bg-background p-8 rounded-lg shadow-md">
                  <div className="mb-8">
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-6">
                          <Image src={post.image} alt={`${post.title} - Blog Post Banner`} data-ai-hint={(post.tags || []).slice(0, 2).join(' ')} fill className="object-cover" />
                      </div>
                      <h1 className="text-3xl md:text-4xl">{post.title}</h1>
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground mt-4">
                          <div className="flex items-center gap-1.5"><User className="h-4 w-4" /> {post.author}</div>
                          <div className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {post.date}</div>
                          <div className="flex items-center gap-1.5"><Tag className="h-4 w-4" /> {post.category}</div>
                      </div>
                  </div>

                  <div dangerouslySetInnerHTML={{ __html: finalContent }} />
                  
                  <div className="mt-8 flex flex-wrap gap-2">
                      {(post.tags || []).map(tag => (
                          <Link href={`/blog/tag/${tag}`} key={tag}>
                             <Badge variant="secondary">{tag}</Badge>
                          </Link>
                      ))}
                  </div>

                  <ShareButtons title={post.title} />

              </article>
              <aside className="lg:col-span-1 space-y-8">
                   <AdPlaceholder />
                   <AdPlaceholder className="h-96" />
              </aside>
          </div>
        </div>
      </div>
    </>
  );
}
