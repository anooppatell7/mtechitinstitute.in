
"use client";

import type { Review } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Star, User, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReviewFormModal } from "@/components/review-form-modal";
import { cn } from "@/lib/utils";

export default function ReviewPageClient({ reviews }: { reviews: Review[] }) {
    return (
        <div className="bg-gradient-to-br from-indigo-600 via-blue-500 to-cyan-400 text-white">
            <div className="container py-16 sm:py-24">
                <div className="text-center mb-12">
                    <h1 className="font-headline text-4xl font-bold sm:text-5xl">Student Reviews</h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-blue-50">
                        Honest feedback from the students we've helped to build their careers in tech.
                    </p>
                    <div className="mt-8">
                        <ReviewFormModal>
                             <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                                <MessageSquarePlus className="mr-2 h-5 w-5" />
                                Leave a Review
                            </Button>
                        </ReviewFormModal>
                    </div>
                </div>

                {reviews.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {reviews.map((review) => (
                            <Card key={review.id} className="flex flex-col shadow-lg bg-white/10 backdrop-blur-sm border border-white/20">
                                <CardContent className="p-6 flex-grow flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center mb-4">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star key={i} className={cn("h-5 w-5", i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-white/50")} />
                                            ))}
                                        </div>
                                        <p className="text-white/80 italic">"{review.comment}"</p>
                                    </div>
                                    <div className="flex items-center gap-3 mt-6 pt-4 border-t border-white/20">
                                        <div className="p-2 bg-white/20 rounded-full">
                                            <User className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                          <p className="font-semibold text-white">{review.name}</p>
                                          <p className="text-xs text-white/70">{review.submittedAt}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white/10 rounded-lg">
                        <p className="text-lg text-white">No reviews have been posted yet.</p>
                        <p className="text-sm text-white/80 mt-2">Be the first to share your experience!</p>
                    </div>
                )}
            </div>
        </div>
    )
}
