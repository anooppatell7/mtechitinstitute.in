
"use client";

import { db } from "@/firebase";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import type { Review } from "@/lib/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Star, User, MessageSquare } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

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


export default function Testimonials() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeaturedReviews().then(data => {
        setReviews(data);
        setLoading(false);
    });
  }, []);

  if (loading) {
    return (
        <section className="py-16 sm:py-24 bg-background">
            <div className="container text-center">
                 <h2 className="font-headline text-3xl font-bold text-primary sm:text-4xl">What Our Students Say</h2>
                 <p className="mt-4 max-w-2xl mx-auto text-lg text-primary/80">Loading testimonials...</p>
            </div>
        </section>
    );
  }

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
                               <Card className="h-full flex flex-col justify-between shadow-lg bg-card border-t-4 border-accent rounded-lg overflow-hidden">
                                    <CardContent className="p-8 pb-4 relative">
                                        <MessageSquare className="absolute top-4 right-4 h-16 w-16 text-primary/5" />
                                        <div className="flex items-center mb-4">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star key={i} className={cn("h-5 w-5", i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30")} />
                                            ))}
                                        </div>
                                        <p className="text-foreground/80 italic text-lg relative z-10">"{review.comment}"</p>
                                    </CardContent>
                                    <CardFooter className="p-6 bg-secondary/50">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-primary text-primary-foreground rounded-full shadow-md">
                                                <User className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-lg text-primary">{review.name}</p>
                                            </div>
                                        </div>
                                    </CardFooter>
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
