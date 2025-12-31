
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { db } from '@/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

import type { ExamRegistration, MockTest } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User, BookOpen } from 'lucide-react';
import SectionDivider from '@/components/section-divider';

const validationSchema = z.object({
  registrationNumber: z.string().min(5, "Please enter a valid registration number."),
});

export default function StartExamPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [studentDetails, setStudentDetails] = useState<ExamRegistration | null>(null);
  const [availableTest, setAvailableTest] = useState<MockTest | null>(null);
  
  const { toast } = useToast();
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<{ registrationNumber: string }>({
    resolver: zodResolver(validationSchema),
  });

  const onVerify: (data: { registrationNumber: string }) => void = async ({ registrationNumber }) => {
    setIsLoading(true);
    setStudentDetails(null);
    setAvailableTest(null);

    try {
      const q = query(
        collection(db, "examRegistrations"),
        where("registrationNumber", "==", registrationNumber.trim().toUpperCase()),
        limit(1)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast({
          title: "Not Found",
          description: "No student found with this registration number.",
          variant: "destructive",
        });
      } else {
        const studentData = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as ExamRegistration;
        setStudentDetails(studentData);
        
        // Fetch any available test from the "Student Exam" category
        const testsQuery = query(
            collection(db, "mockTests"), 
            where("isPublished", "==", true), 
            where("categoryName", "==", "Student Exam"),
            limit(1)
        );
        const testsSnapshot = await getDocs(testsQuery);
        
        if (testsSnapshot.empty) {
            toast({ title: "No Exam Found", description: "There are no official exams available at the moment.", variant: "destructive" });
        } else {
            const test = { id: testsSnapshot.docs[0].id, ...testsSnapshot.docs[0].data() } as MockTest;
            setAvailableTest(test);
            toast({ title: "Verification Successful", description: "Please confirm your details and start the exam." });
        }
      }
    } catch (error) {
      console.error("Verification failed:", error);
      toast({ title: "Error", description: "An error occurred during verification.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartTest = () => {
    if (!availableTest) {
        toast({ title: "No Exam Available", description: "There is no exam for you to start.", variant: "destructive"});
        return;
    }
    if (!studentDetails || !studentDetails.registrationNumber) {
        toast({ title: "Student details not found.", description: "Please re-verify your registration number.", variant: "destructive"});
        return;
    }
    // Pass the correct registration number and student name as query parameters.
    const params = new URLSearchParams({
        regNo: studentDetails.registrationNumber,
        studentName: studentDetails.fullName
    });
    router.push(`/mock-tests/${availableTest.id}?${params.toString()}`);
  };

  return (
    <>
        <div className="bg-gradient-to-br from-indigo-600 via-blue-500 to-cyan-400 text-white">
            <div className="container py-16 sm:py-24 text-center">
                <h1 className="font-headline text-4xl font-bold sm:text-5xl">Start Your Exam</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-blue-50">
                    Enter your registration number to begin the examination process.
                </p>
            </div>
        </div>
        <div className="bg-secondary relative">
            <SectionDivider style="wave" className="text-gradient-to-br from-indigo-600 via-blue-500 to-cyan-400" position="top"/>
            <div className="container py-16 sm:py-24 flex justify-center">
                <Card className="w-full max-w-2xl shadow-lg">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Student Verification</CardTitle>
                        <CardDescription>Enter the registration number you received after completing the registration form.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!studentDetails ? (
                            <form onSubmit={handleSubmit(onVerify)} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="registrationNumber">Registration Number</Label>
                                    <Input
                                        id="registrationNumber"
                                        placeholder="e.g., MTECH-2025-0001"
                                        {...register("registrationNumber")}
                                    />
                                    {errors.registrationNumber && (
                                        <p className="text-sm text-destructive">{errors.registrationNumber.message}</p>
                                    )}
                                </div>
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Verify Details
                                </Button>
                            </form>
                        ) : (
                            <div className="space-y-6">
                                <Card className="bg-primary/5">
                                    <CardHeader className="text-center">
                                        <div className="w-24 h-24 rounded-full mx-auto overflow-hidden border-4 border-white shadow-md bg-muted flex items-center justify-center">
                                            <User className="h-12 w-12 text-muted-foreground" />
                                        </div>
                                        <CardTitle className="mt-4">{studentDetails.fullName}</CardTitle>
                                        <CardDescription>{studentDetails.registrationNumber}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="text-sm">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div><strong>Father's Name:</strong> {studentDetails.fatherName}</div>
                                            <div><strong>Course:</strong> {studentDetails.course}</div>
                                            <div><strong>Email:</strong> {studentDetails.email}</div>
                                            <div><strong>Phone:</strong> {studentDetails.phone}</div>
                                        </div>
                                    </CardContent>
                                </Card>
                                
                                {availableTest ? (
                                    <div className="space-y-4">
                                         <Label>Available Exam</Label>
                                         <div className="flex items-center gap-3 rounded-md border bg-background p-4">
                                             <BookOpen className="h-5 w-5 text-accent" />
                                             <span className="font-semibold text-primary">{availableTest.title}</span>
                                         </div>
                                    </div>
                                ) : (
                                    <div className="text-center text-muted-foreground p-4 border border-dashed rounded-md">
                                        No exam is currently available for your registered course.
                                    </div>
                                )}
                                
                                <div className="flex flex-col sm:flex-row gap-4">
                                     <Button variant="outline" className="w-full" onClick={() => setStudentDetails(null)}>Back</Button>
                                     <Button className="w-full" onClick={handleStartTest} disabled={!availableTest}>Start Exam</Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    </>
  );
}
