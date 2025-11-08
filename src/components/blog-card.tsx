import Link from "next/link";
import Image from "next/image";
import { Calendar, User, Tag } from "lucide-react";
import type { BlogPost } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type BlogCardProps = {
  post: BlogPost;
};

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-xl group">
      <CardHeader className="p-0">
        <Link href={`/blog/${post.slug}`} className="block relative h-56 w-full">
            <Image
              src={post.image}
              alt={`${post.title} - MTech IT Institute Blog`}
              data-ai-hint={post.tags.slice(0, 2).join(' ')}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
        </Link>
      </CardHeader>
      <CardContent className="p-6 flex-grow">
        <div className="mb-4 flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
                <User className="h-3 w-3" />
                <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-1.5">
                <Calendar className="h-3 w-3" />
                <span>{post.date}</span>
            </div>
        </div>
        <CardTitle className="font-headline text-xl mb-2 leading-tight">
          <Link href={`/blog/${post.slug}`} className="hover:text-accent transition-colors">
            {post.title}
          </Link>
        </CardTitle>
        <CardDescription className="line-clamp-3">
          {post.summary}
        </CardDescription>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <div className="flex flex-wrap gap-2">
            {post.tags.map(tag => (
                <Link href={`/blog/tag/${tag}`} key={tag}>
                  <Badge variant="secondary" className="hover:bg-accent/20 transition-colors">{tag}</Badge>
                </Link>
            ))}
        </div>
      </CardFooter>
    </Card>
  );
}
