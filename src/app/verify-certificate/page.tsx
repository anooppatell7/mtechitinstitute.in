
"use client";

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from "@/components/ui/input";
import { Loader2, Search, CheckCircle, XCircle, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import SectionDivider from '@/components/section-divider';
import type { ExamResult } from '@/lib/types';
import { format } from 'date-fns';

const formSchema = z.object({
  certificateId: z.string().min(5, "Please enter a valid Certificate ID."),
});

type FormData = z.infer<typeof formSchema>;

export default function VerifyCertificatePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<ExamResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setVerificationResult(null);
    setNotFound(false);
    try {
      const q = query(
        collection(db, "examResults"),
        where("certificateId", "==", data.certificateId.trim()),
        limit(1)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setNotFound(true);
      } else {
        const resultData = querySnapshot.docs[0].data() as ExamResult;
        setVerificationResult(resultData);
      }
    } catch (error) {
      console.error("Error verifying certificate:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="bg-gradient-to-br from-indigo-600 via-blue-500 to-cyan-400 text-white">
        <div className="container py-16 sm:py-24 text-center">
          <h1 className="font-headline text-4xl font-bold sm:text-5xl">Verify Certificate<span className="text-green-300">.</span></h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-blue-50">
            Enter the Certificate ID found on the certificate to verify its authenticity.
          </p>
        </div>
      </div>
      <div className="bg-secondary relative">
        <SectionDivider style="wave" className="text-gradient-to-br from-indigo-600 via-blue-500 to-cyan-400" position="top"/>
        <div className="container py-16 sm:py-24 flex justify-center">
          <Card className="w-full max-w-lg shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Certificate Verification</CardTitle>
              <CardDescription>Enter the ID to check the certificate details.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="certificateId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Certificate ID</FormLabel>
                        <FormControl>
                          <div className="relative">
                             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                             <Input placeholder="e.g., CERT-2025-123456" {...field} className="pl-10" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                    {isLoading ? 'Verifying...' : 'Verify'}
                  </Button>
                </form>
              </Form>

              {verificationResult && (
                 <Card className="mt-8 bg-green-500/10 border-green-500">
                    <CardHeader className="flex-row items-center gap-4">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                        <div>
                            <CardTitle className="text-green-800">Certificate Verified</CardTitle>
                            <CardDescription className="text-green-700">This is a valid certificate issued by MTech IT Institute.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p><strong>Student Name:</strong> {verificationResult.studentName}</p>
                        <p><strong>Course / Exam:</strong> {verificationResult.testName}</p>
                        <p><strong>Score:</strong> {verificationResult.score} / {verificationResult.totalMarks}</p>
                        <p><strong>Date of Exam:</strong> {format(new Date(verificationResult.submittedAt.seconds * 1000), "dd MMMM, yyyy")}</p>
                    </CardContent>
                 </Card>
              )}

              {notFound && (
                 <Card className="mt-8 bg-destructive/10 border-destructive">
                    <CardHeader className="flex-row items-center gap-4">
                        <XCircle className="h-10 w-10 text-destructive" />
                         <div>
                            <CardTitle className="text-destructive">Verification Failed</CardTitle>
                            <CardDescription className="text-destructive/80">No certificate found with this ID.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-destructive/90">Please check the Certificate ID and try again. Ensure there are no typos.</p>
                    </CardContent>
                 </Card>
              )}

            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
