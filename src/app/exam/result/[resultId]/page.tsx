
"use client";

import React, { useEffect, useState } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { MockTest, ExamResult as ExamResultType, ExamRegistration } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, Clock, Target, Check, X, ShieldQuestion, HelpCircle, Award, Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import SectionDivider from '@/components/section-divider';

const COLORS = {
  correct: 'hsl(var(--chart-2))',
  incorrect: 'hsl(var(--chart-1))',
  unattempted: 'hsl(var(--muted))'
};

function ResultSkeleton() {
    return (
        <div className="bg-secondary min-h-screen">
            <div className="container py-8 sm:py-12">
                 <div className="space-y-4 mb-8 animate-pulse">
                     <Skeleton className="h-10 w-2/3" />
                     <Skeleton className="h-6 w-1/3" />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                     {Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-32 rounded-lg" />)}
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                     <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-96 rounded-lg" />
                     </div>
                     <div className="space-y-6">
                        <Skeleton className="h-80 rounded-lg" />
                     </div>
                 </div>
            </div>
        </div>
    );
}

export default function ExamResultPage() {
    const params = useParams();
    const resultId = params.resultId as string;
    const { user, isLoading: userLoading } = useUser();
    const router = useRouter();

    const [result, setResult] = useState<ExamResultType | null>(null);
    const [test, setTest] = useState<MockTest | null>(null);
    const [rank, setRank] = useState<number | null>(null);
    const [isRankLoading, setIsRankLoading] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        if (!resultId) return;

        const fetchResultAndTest = async () => {
            setIsLoading(true);
            const resultRef = doc(db, 'examResults', resultId);
            const resultSnap = await getDoc(resultRef);

            if (!resultSnap.exists()) {
                notFound();
                return;
            }

            const resultData = { id: resultSnap.id, ...resultSnap.data() } as ExamResultType;
            
            // Authorization Check
            if (user) {
                const isAdmin = user.email && ["mtechitinstitute@gmail.com", "anooppbh8@gmail.com"].includes(user.email);
                let isOwner = false;
                
                // A user is the owner if their UID matches the UID on the registration document associated with this result.
                const registrationQuery = query(collection(db, "examRegistrations"), where("registrationNumber", "==", resultData.registrationNumber), limit(1));
                const registrationSnapshot = await getDocs(registrationQuery);

                if (!registrationSnapshot.empty) {
                    const registrationDoc = registrationSnapshot.docs[0];
                    if(registrationDoc.id === user.uid) {
                        isOwner = true;
                    }
                }

                if (isAdmin || isOwner) {
                    setIsAuthorized(true);
                } else {
                    setIsAuthorized(false);
                }
            } else {
                 // Public link sharing is allowed for now, can be restricted by setting to false
                 setIsAuthorized(true);
            }

            setResult(resultData);
            document.title = `Result: ${resultData.testName} - MTech IT Institute`;

            const testRef = doc(db, 'mockTests', resultData.testId);
            const testSnap = await getDoc(testRef);

            if (testSnap.exists()) {
                setTest({ id: testSnap.id, ...testSnap.data() } as MockTest);
            } else {
                 console.error("Associated test not found!");
            }
            
            setIsLoading(false);
            fetchRank(resultData);
        };
        
        const fetchRank = async (currentResult: ExamResultType) => {
            setIsRankLoading(true);
            try {
                const resultsQuery = query(
                    collection(db, "examResults"),
                    where("testId", "==", currentResult.testId)
                );
                const querySnapshot = await getDocs(resultsQuery);
                const allResults = querySnapshot.docs.map(doc => doc.data() as ExamResultType);

                // Ensure submittedAt is a valid date for sorting
                allResults.forEach(r => {
                    if (r.submittedAt && r.submittedAt.seconds) {
                        r.submittedAt = new Date(r.submittedAt.seconds * 1000);
                    }
                });

                allResults.sort((a, b) => b.score - a.score || a.timeTaken - b.timeTaken);

                const currentUserRank = allResults.findIndex(r => r.registrationNumber === currentResult.registrationNumber && new Date(r.submittedAt).getTime() === new Date(currentResult.submittedAt).getTime()) + 1;


                setRank(currentUserRank > 0 ? currentUserRank : null);
            } catch (error) {
                console.error("Failed to calculate rank:", error);
                setRank(null);
            } finally {
                setIsRankLoading(false);
            }
        };

        fetchResultAndTest();
    }, [resultId, user]);

    if (isLoading || userLoading) {
        return <ResultSkeleton />;
    }
    
    if (isAuthorized === false) {
        return (
            <div className="container text-center py-20">
                <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
                <p className="text-muted-foreground mt-2">You do not have permission to view this result.</p>
                <Button onClick={() => router.push('/profile')} className="mt-6">Go to My Profile</Button>
            </div>
        )
    }

    if (!result || !test) {
        return <div className="text-center py-10">Result or test not found.</div>;
    }

    const timeTakenFormatted = `${Math.floor(result.timeTaken / 60)}m ${result.timeTaken % 60}s`;

    const correctCount = result.responses.filter(r => r.isCorrect).length;
    const incorrectCount = result.responses.filter(r => !r.isCorrect && r.selectedOption !== null).length;
    const unattemptedCount = result.responses.filter(r => r.selectedOption === null).length;

    const chartData = [
        { name: 'Correct', value: correctCount, color: COLORS.correct },
        { name: 'Incorrect', value: incorrectCount, color: COLORS.incorrect },
        { name: 'Unattempted', value: unattemptedCount, color: COLORS.unattempted }
    ];

    const getQuestionById = (id: string) => test.questions.find(q => q.id === id);

    return (
        <div className="bg-background">
            <div className="bg-secondary relative">
                <SectionDivider style="wave" className="text-background" position="top"/>
                <div className="container py-8 sm:py-12">
                    <div className="mb-8">
                        <h1 className="text-3xl sm:text-4xl font-bold text-primary font-headline">Exam Result</h1>
                        <p className="text-muted-foreground mt-1">Analysis for <span className="font-semibold text-foreground">{result.studentName}</span> in "{result.testName}"</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Score</CardTitle>
                                <BarChart className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{result.score} / {result.totalMarks}</div>
                                <p className="text-xs text-muted-foreground">Marks Obtained</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
                                <Target className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{result.accuracy}%</div>
                                <p className="text-xs text-muted-foreground">Based on attempted questions</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Time Taken</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{timeTakenFormatted}</div>
                                <p className="text-xs text-muted-foreground">Total time spent</p>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Rank</CardTitle>
                                <Award className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                 {isRankLoading ? (
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                ) : (
                                    <div className="text-2xl font-bold">{rank || 'N/A'}</div>
                                )}
                                <p className="text-xs text-muted-foreground">Your position among all test takers</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                         <div className="lg:col-span-2 space-y-4">
                            <Card>
                                 <CardHeader><CardTitle>Question Review</CardTitle></CardHeader>
                                 <CardContent>
                                    {result.responses.map((response, index) => {
                                        const question = getQuestionById(response.questionId);
                                        if (!question) return null;

                                        const userAnswerIndex = response.selectedOption;
                                        const correctAnswerIndex = question.correctOption;
                                        
                                        return (
                                            <div key={index} className="py-4 border-b last:border-b-0">
                                                <p className="font-semibold">{index + 1}. {question.questionText}</p>
                                                <div className="mt-4 space-y-2 text-sm">
                                                    {question.options.map((option, i) => (
                                                        <div key={i} className={cn(
                                                            "flex items-start gap-3 p-3 rounded-md border",
                                                            i === correctAnswerIndex && "bg-green-500/10 border-green-500",
                                                            i === userAnswerIndex && i !== correctAnswerIndex && "bg-red-500/10 border-red-500"
                                                        )}>
                                                            <div className="flex-shrink-0 mt-1">
                                                                {i === correctAnswerIndex ? <Check className="h-4 w-4 text-green-600" /> : 
                                                                 i === userAnswerIndex ? <X className="h-4 w-4 text-red-600" /> : 
                                                                 <div className="h-4 w-4" />}
                                                            </div>
                                                            <span>{option}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                {question.explanation && (
                                                    <div className="mt-4 p-3 bg-blue-500/10 rounded-md text-sm flex items-start gap-3">
                                                       <HelpCircle className="h-4 w-4 mt-1 text-blue-600 flex-shrink-0"/>
                                                        <div>
                                                            <h4 className="font-semibold text-blue-800">Explanation</h4>
                                                            <p className="text-blue-700">{question.explanation}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                 </CardContent>
                            </Card>
                         </div>
                        <div className="space-y-6 sticky top-24">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Performance Summary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-64">
                                         <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={chartData}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                >
                                                    {chartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="mt-4 space-y-2 text-sm">
                                        <div className="flex justify-between items-center"><span className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500"/>Correct</span> <span>{correctCount}</span></div>
                                        <div className="flex justify-between items-center"><span className="flex items-center gap-2"><X className="h-4 w-4 text-red-500"/>Incorrect</span> <span>{incorrectCount}</span></div>
                                        <div className="flex justify-between items-center"><span className="flex items-center gap-2"><ShieldQuestion className="h-4 w-4 text-gray-500"/>Unattempted</span> <span>{unattemptedCount}</span></div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

    