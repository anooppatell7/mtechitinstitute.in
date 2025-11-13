
"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListChecks, Clock, ArrowRight, BarChart } from "lucide-react";
import type { MockTest, TestResult } from "@/lib/types";

export default function MockTestsClient({ mockTests, userResults }: { mockTests: MockTest[], userResults: TestResult[] }) {
    
    // Create a map for quick lookup of the latest result for each test
    const latestResultsMap = new Map<string, TestResult>();
    userResults.forEach(result => {
        const existing = latestResultsMap.get(result.testId);
        if (!existing || (result.submittedAt && existing.submittedAt && result.submittedAt.seconds > existing.submittedAt.seconds)) {
            latestResultsMap.set(result.testId, result);
        }
    });

    return (
        <div className="bg-secondary">
            <div className="container py-16 sm:py-24">
                <div className="text-center mb-12">
                    <h1 className="font-headline text-4xl font-bold text-primary sm:text-5xl">Online Mock Tests</h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-primary/80">
                        Sharpen your skills and prepare for success with our collection of mock tests.
                    </p>
                </div>
                
                {mockTests.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {mockTests.map((test) => {
                            const hasAttempted = latestResultsMap.has(test.id);
                            const result = latestResultsMap.get(test.id);

                            return (
                                <Card key={test.id} className="flex flex-col shadow-sm hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <CardTitle className="font-headline text-xl text-primary">{test.title}</CardTitle>
                                        <CardDescription className="line-clamp-3 h-[60px]">{test.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-grow">
                                        <div className="flex justify-between text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <ListChecks className="h-4 w-4" />
                                                <span>{test.questions?.length || 0} Questions</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                <span>{test.duration} minutes</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex flex-col sm:flex-row gap-2">
                                        {hasAttempted && result ? (
                                            <>
                                                <Button asChild variant="outline" className="w-full">
                                                    <Link href={`/mock-tests/result/${result.id}`}>
                                                        <BarChart className="mr-2 h-4 w-4" /> View Result
                                                    </Link>
                                                </Button>
                                                <Button asChild className="w-full">
                                                    <Link href={`/mock-tests/${test.id}`}>
                                                        Re-attempt Test <ArrowRight className="ml-2 h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </>
                                        ) : (
                                            <Button asChild className="w-full">
                                                <Link href={`/mock-tests/${test.id}`}>
                                                    Start Test <ArrowRight className="ml-2 h-4 w-4" />
                                                </Link>
                                            </Button>
                                        )}
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="p-12 text-center text-muted-foreground">
                            <p className="text-lg">No mock tests are available at the moment.</p>
                            <p className="mt-2 text-sm">Please check back later for new practice tests.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
