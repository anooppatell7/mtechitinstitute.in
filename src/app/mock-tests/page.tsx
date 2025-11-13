
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListChecks, Clock, ArrowRight, BarChart } from "lucide-react";
import type { MockTest, TestResult } from "@/lib/types";
import { useUser, useFirestore } from "@/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/lib/firebase";
import SectionDivider from "@/components/section-divider";

function TestsLoadingSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({length: 3}).map((_, i) => (
                <Card key={i}>
                    <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-10 w-full mt-2" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-5 w-full" />
                    </CardContent>
                    <CardFooter>
                        <Skeleton className="h-10 w-full" />
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}

export default function MockTestsPage() {
    const { user, isLoading: userLoading } = useUser();
    const firestore = useFirestore(); // Use the hook since we are in a client component
    
    const [mockTests, setMockTests] = useState<MockTest[]>([]);
    const [userResults, setUserResults] = useState<TestResult[]>([]);
    
    const [testsLoading, setTestsLoading] = useState(true);
    const [resultsLoading, setResultsLoading] = useState(true);

    // Fetch the list of all published tests
    useEffect(() => {
        const getPublishedMockTests = async () => {
            setTestsLoading(true);
            try {
                const testsQuery = query(
                    collection(db, "mockTests"),
                    where("isPublished", "==", true)
                );
                const testsSnapshot = await getDocs(testsQuery);
                const testList = testsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MockTest));
                setMockTests(testList);
            } catch (error) {
                console.error("Failed to fetch mock tests:", error);
            } finally {
                setTestsLoading(false);
            }
        };
        
        getPublishedMockTests();
    }, []);

    // Fetch results for the current user
    useEffect(() => {
        const fetchUserResults = async () => {
            if (!user || !firestore) {
                setResultsLoading(false);
                return;
            };
            setResultsLoading(true);
            try {
                const resultsQuery = query(
                    collection(firestore, 'testResults'),
                    where('userId', '==', user.uid)
                );
                const resultsSnapshot = await getDocs(resultsQuery);
                let results = resultsSnapshot.docs.map(doc => {
                    const data = doc.data();
                    const submittedAt = data.submittedAt?.toDate ? data.submittedAt.toDate() : new Date(0);
                    return { 
                        id: doc.id,
                        ...data,
                        submittedAt
                    } as TestResult
                });

                results.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
                setUserResults(results);
            } catch (error) {
                console.error("Failed to fetch user results:", error);
            } finally {
                setResultsLoading(false);
            }
        };

        if (!userLoading) {
            fetchUserResults();
        }
    }, [user, userLoading, firestore]);
    
    // Create a map for quick lookup of the latest result for each test
    const latestResultsMap = new Map<string, TestResult>();
    userResults.forEach(result => {
        if (!latestResultsMap.has(result.testId)) {
            latestResultsMap.set(result.testId, result);
        }
    });

    const isLoading = userLoading || resultsLoading || testsLoading;

    return (
        <>
            <div className="bg-background">
                <div className="container py-16 sm:py-24 text-center">
                    <h1 className="font-headline text-4xl font-bold text-primary sm:text-5xl">Online Mock Tests<span className="text-accent">.</span></h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-primary/80">
                        Sharpen your skills and prepare for success with our collection of mock tests.
                    </p>
                </div>
            </div>
            
            <div className="bg-secondary relative">
                <SectionDivider style="wave" className="text-background" position="top"/>
                <div className="container py-16 sm:py-24">
                    {isLoading ? (
                        <TestsLoadingSkeleton />
                    ) : mockTests.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {mockTests.map((test) => {
                                const hasAttempted = latestResultsMap.has(test.id);
                                const result = latestResultsMap.get(test.id);

                                return (
                                    <Card key={test.id} className="flex flex-col shadow-sm hover:shadow-lg transition-shadow bg-background">
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
                                            {user && hasAttempted && result ? (
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
                                                    <Link href={user ? `/mock-tests/${test.id}`: '/login?redirect=/mock-tests'}>
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
        </>
    );
}
