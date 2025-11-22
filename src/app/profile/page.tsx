
'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy, runTransaction, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ExamRegistration, ExamResult, Certificate } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Mail, Phone, Calendar, Key, UserCheck, Briefcase, FileText, BarChart, GraduationCap, Award, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { generateCertificatePdf } from '@/lib/certificate-generator';

function ProfileSkeleton() {
    return (
        <div className="bg-secondary min-h-[80vh]">
            <div className="container py-16 sm:py-24 animate-pulse">
                <Card className="max-w-4xl mx-auto shadow-lg">
                    <CardHeader className="bg-muted/30 p-8">
                        <div className="flex items-center gap-6">
                            <Skeleton className="h-24 w-24 rounded-full" />
                            <div className="space-y-3">
                                 <Skeleton className="h-8 w-48" />
                                 <Skeleton className="h-5 w-64" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <Skeleton className="h-8 w-40 mb-6" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            {Array.from({length: 6}).map((_, i) => (
                                <div key={i} className="flex gap-4">
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                    <div className='flex-1 space-y-2'>
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-5 w-40" />
                                    </div>
                                </div>
                            ))}
                        </div>
                         <div className="mt-12">
                            <Skeleton className="h-8 w-40 mb-4" />
                            <Skeleton className="h-32 w-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function ProfileDetail({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | undefined }) {
    return (
        <div className="flex items-center gap-4">
            <div className="flex-shrink-0 text-accent bg-accent/10 p-2 rounded-full">{icon}</div>
            <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="font-semibold text-base text-primary/90">{value || 'Not provided'}</p>
            </div>
        </div>
    )
}

export default function ProfilePage() {
    const { user, isLoading: userLoading } = useUser();
    const [registration, setRegistration] = useState<ExamRegistration | null>(null);
    const [examHistory, setExamHistory] = useState<ExamResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGeneratingCert, setIsGeneratingCert] = useState<string | null>(null);
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        if (userLoading) return;
        if (!user) {
            router.push('/login?redirect=/profile');
            return;
        }

        const fetchProfileData = async () => {
            setIsLoading(true);
            const docRef = doc(db, 'examRegistrations', user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const regData = { id: docSnap.id, ...docSnap.data() } as ExamRegistration;
                setRegistration(regData);

                // Fetch Exam History
                const historyQuery = query(
                    collection(db, "examResults"),
                    where("registrationNumber", "==", regData.registrationNumber),
                    orderBy("submittedAt", "desc")
                );
                const historySnapshot = await getDocs(historyQuery);
                const history = historySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as ExamResult));
                setExamHistory(history);

            }
            setIsLoading(false);
        };

        fetchProfileData();
    }, [user, userLoading, router]);

    const handleGenerateCertificate = async (result: ExamResult) => {
        if (!registration) return;
        setIsGeneratingCert(result.id);

        try {
            const certIdNumber = `MTECH-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;

            const issueDate = new Date();
            let examDateObj;
            if (result.submittedAt && typeof result.submittedAt.toDate === 'function') {
                examDateObj = result.submittedAt.toDate();
            } else if (result.submittedAt && result.submittedAt.seconds) {
                examDateObj = new Date(result.submittedAt.seconds * 1000);
            } else if (result.submittedAt) {
                examDateObj = new Date(result.submittedAt);
            } else {
                examDateObj = new Date(); // Fallback
            }
            
             if (isNaN(examDateObj.getTime())) {
                throw new Error("Invalid exam date could not be parsed.");
            }

            const certDataForPdf = {
                ...result,
                certificateId: certIdNumber,
                issueDate: issueDate.toISOString(),
                examDate: examDateObj.toISOString(),
                percentage: (result.score / result.totalMarks) * 100
            };
            
            const pdfBlob = await generateCertificatePdf(certDataForPdf);

            // Create a temporary URL for the blob
            const url = window.URL.createObjectURL(pdfBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Certificate-${result.studentName}-${result.testName.replace(/ /g, '_')}.pdf`;
            document.body.appendChild(a);
            a.click();
            
            // Clean up
            a.remove();
            window.URL.revokeObjectURL(url);

            toast({
                title: "Certificate Downloaded!",
                description: "Your certificate should be in your downloads folder.",
            });

        } catch (error: any) {
            console.error("CERTIFICATE ERROR", error);
            let description = "An unexpected error occurred. Please try again or contact support.";
            if (error.message.includes("PDF")) {
                description = "Could not generate the certificate PDF. Please try again.";
            }

            toast({
                title: "Certificate Generation Failed",
                description: description,
                variant: "destructive"
            });
        } finally {
            setIsGeneratingCert(null);
        }
    }


    const getInitials = (name: string) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    const loading = userLoading || isLoading;

    if (loading) {
        return <ProfileSkeleton />;
    }

    if (!registration) {
         return (
            <div className="bg-background">
                <div className="container py-16 sm:py-24 text-center">
                    <GraduationCap className="mx-auto h-16 w-16 text-primary/30" />
                    <h1 className="font-headline text-4xl font-bold text-primary sm:text-5xl mt-6">Profile Not Found</h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-primary/80">
                        You have not completed your student registration yet. Please register to view your profile and access exams.
                    </p>
                     <div className="mt-8">
                        <Button asChild size="lg"><Link href="/exam/register">Register for Exam</Link></Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-secondary">
             <div className="container py-12 sm:py-20">
                <Card className="max-w-4xl mx-auto shadow-2xl overflow-hidden border-t-4 border-t-accent">
                    <CardHeader className="bg-card p-8 border-b">
                         <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                            <Avatar className="w-28 h-28 text-4xl border-4 border-primary/10 shadow-md">
                                <AvatarFallback className="bg-primary/20 text-primary font-semibold">{getInitials(registration.fullName)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-4xl font-headline text-primary">{registration.fullName}</CardTitle>
                                <CardDescription className="text-base text-muted-foreground mt-1 flex items-center justify-center sm:justify-start gap-2">
                                   <Mail className="h-4 w-4" /> {registration.email}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 bg-background">
                        <h3 className="font-headline text-2xl text-primary mb-6 border-l-4 border-accent pl-4">Personal Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                            <ProfileDetail icon={<Key className="h-6 w-6"/>} label="Registration Number" value={registration.registrationNumber} />
                            <ProfileDetail icon={<Briefcase className="h-6 w-6"/>} label="Course" value={registration.course} />
                            <ProfileDetail icon={<User className="h-6 w-6"/>} label="Father's Name" value={registration.fatherName} />
                            <ProfileDetail icon={<Phone className="h-6 w-6"/>} label="Phone Number" value={registration.phone} />
                            <ProfileDetail icon={<Calendar className="h-6 w-6"/>} label="Date of Birth" value={format(new Date(registration.dob), "PPP")} />
                            <ProfileDetail icon={<UserCheck className="h-6 w-6"/>} label="Gender" value={registration.gender} />
                        </div>

                        <div className="mt-12 pt-8 border-t">
                            <h3 className="font-headline text-2xl text-primary mb-6 border-l-4 border-accent pl-4">Exam History</h3>
                            {examHistory.length > 0 ? (
                                <div className="border rounded-lg overflow-hidden bg-card">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Exam Name</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Score</TableHead>
                                                <TableHead className="text-right">Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {examHistory.map(result => {
                                                const isGenerating = isGeneratingCert === result.id;
                                                
                                                return (
                                                    <TableRow key={result.id}>
                                                        <TableCell className="font-medium">{result.testName}</TableCell>
                                                        <TableCell>{format(new Date(result.submittedAt.seconds * 1000), "dd MMM, yyyy")}</TableCell>
                                                        <TableCell>
                                                            <Badge variant={result.score / result.totalMarks > 0.4 ? 'default' : 'destructive'} className="text-sm">
                                                                {result.score} / {result.totalMarks}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right space-x-2">
                                                            <Button asChild variant="outline" size="sm">
                                                                <Link href={`/exam/result/${result.id}`}>
                                                                    <BarChart className="mr-2 h-4 w-4" /> View Result
                                                                </Link>
                                                            </Button>
                                                            
                                                            <Button onClick={() => handleGenerateCertificate(result)} disabled={isGenerating} size="sm">
                                                                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GraduationCap className="mr-2 h-4 w-4" />}
                                                                {isGenerating ? 'Generating...' : 'Download Certificate'}
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="text-center py-10 px-4 border-2 border-dashed rounded-lg bg-card">
                                    <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                    <p className="mt-4 font-semibold text-lg text-primary/90">No Exams Attempted Yet</p>
                                    <p className="text-muted-foreground mt-1">Your past exam results will appear here.</p>
                                    <Button asChild variant="link" className="mt-2 text-accent">
                                        <Link href="/exam">Go to Exams</Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
