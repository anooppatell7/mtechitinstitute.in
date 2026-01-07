
"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Smartphone, CheckCircle, Rocket } from 'lucide-react';
import { getAppLink } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

function Feature({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="flex items-start gap-4">
            <div className="flex-shrink-0 text-accent bg-accent/10 p-3 rounded-full">
                {icon}
            </div>
            <div>
                <h3 className="text-lg font-semibold text-primary">{title}</h3>
                <p className="text-muted-foreground">{description}</p>
            </div>
        </div>
    );
}

export default function AppDownloadPage() {
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchLink() {
            setIsLoading(true);
            const link = await getAppLink();
            setDownloadUrl(link);
            setIsLoading(false);
        }
        fetchLink();
    }, []);

    return (
        <>
            <div className="bg-gradient-to-br from-indigo-600 via-blue-500 to-cyan-400 text-white">
                <div className="container py-12 sm:py-16 text-center">
                    <div className="flex justify-center mb-6">
                        <Image src="https://res.cloudinary.com/dzr4xjizf/image/upload/v1763979689/MTECHITINSTITUTE_logo.png" alt="MTech IT Institute Logo" width={80} height={80} className="rounded-2xl shadow-lg"/>
                    </div>
                    <h1 className="font-headline text-4xl font-bold sm:text-5xl">MTech IT Institute Android App</h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-blue-50">
                        Your personal learning companion, now in your pocket. Access courses, tests, and results anytime, anywhere.
                    </p>
                </div>
            </div>

            <div className="bg-secondary relative -mt-16">
                <div className="container py-16 sm:py-24">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="lg:order-last">
                           <Card className="shadow-xl">
                               <CardHeader className="text-center">
                                   <Smartphone className="mx-auto h-12 w-12 text-accent mb-4" />
                                   <CardTitle className="font-headline text-2xl">Download the App</CardTitle>
                                   <CardDescription>Get started with your learning journey today!</CardDescription>
                               </CardHeader>
                               <CardContent>
                                   {isLoading ? (
                                       <Skeleton className="h-12 w-full" />
                                   ) : downloadUrl ? (
                                        <Button asChild size="lg" className="w-full text-base">
                                          <a href={downloadUrl} download>
                                              <Download className="mr-2 h-5 w-5" /> Download Now
                                          </a>
                                        </Button>
                                   ) : (
                                       <p className="text-center text-destructive">Download link is not available at the moment. Please check back later.</p>
                                   )}
                                    <p className="text-xs text-muted-foreground mt-4 text-center">
                                       Compatible with Android devices. You might need to enable "Install from unknown sources".
                                   </p>
                               </CardContent>
                           </Card>
                        </div>
                        <div className="space-y-8">
                            <h2 className="font-headline text-3xl font-bold text-primary">App Features</h2>
                            <Feature
                                icon={<Rocket className="h-6 w-6" />}
                                title="Interactive Learning"
                                description="Engage with our courses directly on your phone with interactive lessons and quizzes."
                            />
                            <Feature
                                icon={<CheckCircle className="h-6 w-6" />}
                                title="Mock & Official Exams"
                                description="Take practice tests or official certification exams right from the app."
                            />
                            <Feature
                                icon={<Download className="h-6 w-6" />}
                                title="Download Certificates"
                                description="View your results and download your official certificates directly to your device."
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
