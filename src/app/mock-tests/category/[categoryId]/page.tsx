
'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, notFound } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListChecks, Clock, ArrowRight, BarChart, ChevronLeft } from "lucide-react";
import type { MockTest, TestResult, TestCategory, ExamResult } from "@/lib/types";
import { useUser, useFirestore } from "@/firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
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

export default function MockTestsByCategoryPage() {
    const params = useParams();
    const categoryId = params.categoryId as string;
    
    const { user, isLoading: userLoading } = useUser();
    const firestore = useFirestore();

    const [category, setCategory] = useState<TestCategory | null>(null);
    const [mockTests, setMockTests] = useState<MockTest[]>([]);
    const [userResults, setUserResults] = useState<ExamResult[]>([]);
    
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!categoryId) return;

        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch category details
                const categoryRef = doc(db, "testCategories", categoryId);
                const categorySnap = await getDoc(categoryRef);
                if (categorySnap.exists()) {
                    const categoryData = { id: categorySnap.id, ...categorySnap.data() } as TestCategory
                    setCategory(categoryData);
                    document.title = `${categoryData.title} Tests - MTech IT Institute`;
                } else {
                    notFound();
                    return;
                }

                // Fetch tests for this category
                const testsQuery = query(
                    collection(db, "mockTests"),
                    where("categoryId", "==", categoryId),
                    where("isPublished", "==", true)
                );
                const testsSnapshot = await getDocs(testsQuery);
                const testList = testsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MockTest));
                setMockTests(testList);

            } catch (error) {
                console.error("Failed to fetch mock tests by category:", error);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchData();
    }, [categoryId]);

    // Fetch results for the current user
    useEffect(() => {
        const fetchUserResults = async () => {
            if (!user || !firestore || mockTests.length === 0) {
                return;
            };

            const testIds = mockTests.map(t => t.id);
            if (testIds.length === 0) return;

            try {
                const resultsQuery = query(
                    collection(firestore, 'examResults'),
                    where('registrationNumber', '==', user.uid), // Using UID for practice tests
                    where('testId', 'in', testIds)
                );
                const resultsSnapshot = await getDocs(resultsQuery);
                let results = resultsSnapshot.docs.map(doc => {
                    const data = doc.data();
                    const submittedAt = data.submittedAt?.toDate ? data.submittedAt.toDate() : new Date(0);
                    return { id: doc.id, ...data, submittedAt } as ExamResult
                });

                results.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
                setUserResults(results);
            } catch (error) {
                console.error("Failed to fetch user results:", error);
            }
        };

        if (!userLoading && !isLoading) {
            fetchUserResults();
        }
    }, [user, userLoading, firestore, isLoading, mockTests]);
    
    const latestResultsMap = new Map<string, ExamResult>();
    userResults.forEach(result => {
        if (!latestResultsMap.has(result.testId)) {
            latestResultsMap.set(result.testId, result);
        }
    });

    const pageLoading = userLoading || isLoading;

    return (
        <>
            <div className="bg-gradient-to-br from-indigo-600 via-blue-500 to-cyan-400 text-white">
                <div className="container py-16 sm:py-24 text-center">
                    {pageLoading ? <Skeleton className="h-12 w-2/3 mx-auto" /> :
                        <h1 className="font-headline text-4xl font-bold sm:text-5xl">{category?.title} Tests<span className="text-green-300">.</span></h1>
                    }
                    {pageLoading ? <Skeleton className="h-6 w-1/2 mx-auto mt-4" /> :
                      <p className="mt-4 max-w-2xl mx-auto text-lg text-blue-50">
                          {category?.description}
                      </p>
                    }
                </div>
            </div>
            
            <div className="bg-secondary relative">
                <SectionDivider style="wave" className="text-gradient-to-br from-indigo-600 via-blue-500 to-cyan-400" position="top"/>
                <div className="container py-16 sm:py-24">
                     <div className="mb-8">
                        <Button asChild variant="outline">
                            <Link href="/mock-tests">
                                <ChevronLeft className="mr-2 h-4 w-4" />
                                Back to All Categories
                            </Link>
                        </Button>
                    </div>
                    {pageLoading ? (
                        <TestsLoadingSkeleton />
                    ) : mockTests.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {mockTests.map((test) => {
                                const hasAttempted = latestResultsMap.has(test.id);
                                const result = latestResultsMap.get(test.id);

                                return (
                                    <Card key={test.id} className="flex flex-col shadow-sm hover:shadow-lg transition-shadow bg-background border-t-4 border-t-accent">
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
                                        <CardFooter className="flex flex-wrap gap-2">
                                            {user && hasAttempted && result ? (
                                                <>
                                                    <Button asChild variant="outline" className="w-full flex-1">
                                                        <Link href={`/exam/result/${result.id}`}>
                                                            <BarChart className="mr-2 h-4 w-4" /> View Result
                                                        </Link>
                                                    </Button>
                                                    <Button asChild className="w-full flex-1">
                                                        <Link href={`/mock-tests/${test.id}`}>
                                                            Re-attempt Test <ArrowRight className="ml-2 h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button asChild className="w-full">
                                                    <Link href={user ? `/mock-tests/${test.id}`: `/login?redirect=/mock-tests/category/${categoryId}`}>
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
                                <p className="text-lg">No mock tests are available in this category yet.</p>
                                <p className="mt-2 text-sm">Please check back later for new practice tests.</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </>
    );
}
