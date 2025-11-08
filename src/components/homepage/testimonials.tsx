
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import type { Review } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Star, User } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

// This forces the component to be dynamically rendered
export const revalidate = 0;

async function getFeaturedReviews(): Promise<Review[]> {
    const reviewsQuery = query(
        collection(db, "reviews"),
        orderBy("submittedAt", "desc"),
        limit(12) // Fetch a bit more to ensure we get enough approved ones
    );
    const reviewsSnapshot = await getDocs(reviewsQuery);
    const allReviews = reviewsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
    return allReviews.filter(review => review.isApproved).slice(0, 6);
}


export default async function Testimonials() {
  const reviews = await getFeaturedReviews();

  if (reviews.length === 0) {
    return null; // Don't render the section if there are no approved reviews
  }

  return (
    <section className="py-16 sm:py-24 bg-background">
        <div className="container">
            <div className="text-center mb-12">
                <h2 className="font-headline text-3xl font-bold text-primary sm:text-4xl">What Our Students Say</h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-primary/80">
                    Hear from students who have transformed their careers with us.
                </p>
            </div>
            
            <Carousel
                opts={{
                    align: "start",
                    loop: true,
                }}
                className="w-full"
            >
                <CarouselContent>
                    {reviews.map((review) => (
                        <CarouselItem key={review.id} className="md:basis-1/2 lg:basis-1/3">
                            <div className="p-1 h-full">
                               <Card className="h-full flex flex-col shadow-lg bg-secondary/50 border-0">
                                    <CardContent className="p-8 flex-grow flex flex-col justify-between">
                                       <div>
                                            <div className="flex items-center mb-4">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star key={i} className={cn("h-5 w-5", i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/50")} />
                                                ))}
                                            </div>
                                            <p className="text-foreground/80 italic text-lg">"{review.comment}"</p>
                                       </div>
                                        <div className="flex items-center gap-4 mt-6 pt-6 border-t">
                                            <div className="p-3 bg-primary text-primary-foreground rounded-full">
                                                <User className="h-6 w-6" />
                                            </div>
                                            <div>
                                              <p className="font-semibold text-lg text-primary">{review.name}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="hidden sm:flex" />
                <CarouselNext className="hidden sm:flex" />
            </Carousel>
        </div>
    </section>
  )
}
