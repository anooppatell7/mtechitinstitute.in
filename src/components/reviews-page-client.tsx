
"use client";

import type { Review } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Star, User, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReviewFormModal } from "@/components/review-form-modal";
import { cn } from "@/lib/utils";

export default function ReviewPageClient({ reviews }: { reviews: Review[] }) {
    return (
        <div className="bg-background">
            <div className="container py-16 sm:py-24">
                <div className="text-center mb-12">
                    <h1 className="font-headline text-4xl font-bold text-primary sm:text-5xl">Student Reviews</h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-foreground/80">
                        Honest feedback from the students we've helped to build their careers in tech.
                    </p>
                    <div className="mt-8">
                        <ReviewFormModal>
                             <Button size="lg">
                                <MessageSquarePlus className="mr-2 h-5 w-5" />
                                Leave a Review
                            </Button>
                        </ReviewFormModal>
                    </div>
                </div>

                {reviews.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {reviews.map((review) => (
                            <Card key={review.id} className="flex flex-col shadow-sm hover:shadow-lg transition-shadow duration-300 bg-secondary">
                                <CardContent className="p-6 flex-grow flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center mb-4">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star key={i} className={cn("h-5 w-5", i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/50")} />
                                            ))}
                                        </div>
                                        <p className="text-foreground/80 italic">"{review.comment}"</p>
                                    </div>
                                    <div className="flex items-center gap-3 mt-6 pt-4 border-t">
                                        <div className="p-2 bg-muted rounded-full">
                                            <User className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                          <p className="font-semibold text-primary">{review.name}</p>
                                          <p className="text-xs text-muted-foreground">{review.submittedAt}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-lg text-muted-foreground">No reviews have been posted yet.</p>
                        <p className="text-sm text-muted-foreground mt-2">Be the first to share your experience!</p>
                    </div>
                )}
            </div>
        </div>
    )
}
