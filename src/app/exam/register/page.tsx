

"use client";

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, runTransaction, serverTimestamp, getDocs, query, orderBy, getDoc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { Course, ExamRegistration } from '@/lib/types';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import SectionDivider from '@/components/section-divider';
import Link from 'next/link';
import { isValidTLD } from '@/lib/tld-validator';
import ProfilePage from '@/app/profile/page';


const formSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters."),
  fatherName: z.string().min(3, "Father's name must be at least 3 characters."),
  phone: z.string().regex(/^\d{10}$/, "Please enter a valid 10-digit phone number."),
  email: z.string()
    .email({ message: "Please enter a valid email address." })
    .refine(email => isValidTLD(email), {
        message: "The email address must have a valid domain (e.g., .com, .in)."
    }),
  dob: z.date({ required_error: "Date of birth is required." }),
  gender: z.enum(['Male', 'Female', 'Other']),
  course: z.string().min(1, "Please select a course."),
  address: z.string().min(5, "Address must be at least 5 characters."),
  city: z.string().min(2, "City is required."),
  state: z.string().min(2, "State is required."),
  pinCode: z.string().length(6, "Pin code must be 6 digits."),
});

type FormData = z.infer<typeof formSchema>;

export default function ExamRegistrationPage() {
    const { user, isLoading: userLoading } = useUser();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const [registrationNumber, setRegistrationNumber] = useState('');
    const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);
    
    const [courses, setCourses] = useState<Course[]>([]);
    const [coursesLoading, setCoursesLoading] = useState(true);
    const { toast } = useToast();
    
    useEffect(() => {
        document.title = "Exam Registration - MTech IT Institute";
    }, []);

    useEffect(() => {
        if (userLoading) return;
        if (!user) {
            router.push('/login?redirect=/exam/register');
            return;
        }

        const checkRegistration = async () => {
            const docRef = doc(db, 'examRegistrations', user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setIsAlreadyRegistered(true);
            }
        };

        checkRegistration();
    }, [user, userLoading, router]);

    useEffect(() => {
        const fetchCourses = async () => {
            setCoursesLoading(true);
            try {
                const coursesQuery = query(collection(db, "courses"), orderBy("title"));
                const courseSnapshot = await getDocs(coursesQuery);
                const courseList = courseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
                setCourses(courseList);
            } catch (error) {
                console.error("Failed to fetch courses:", error);
                toast({
                    title: "Error",
                    description: "Could not load course list. Please try refreshing.",
                    variant: "destructive",
                });
            } finally {
                setCoursesLoading(false);
            }
        };
        fetchCourses();
    }, [toast]);


    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: '',
            fatherName: '',
            phone: '',
            email: '',
            address: '',
            city: 'Patti',
            state: 'Uttar Pradesh',
            pinCode: '230135',
            course: '',
        }
    });

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        if (!user) {
            toast({ title: "Error", description: "You must be logged in to register.", variant: "destructive" });
            return;
        }
        setIsLoading(true);

        try {
            const counterRef = doc(db, 'counters', 'examRegistrations');
            const newRegNumber = await runTransaction(db, async (transaction) => {
                const counterDoc = await transaction.get(counterRef);
                const currentYear = new Date().getFullYear();
                let newCount = 1;
                
                if (!counterDoc.exists() || counterDoc.data().year !== currentYear) {
                    transaction.set(counterRef, { count: newCount, year: currentYear });
                } else {
                    newCount = counterDoc.data().count + 1;
                    transaction.update(counterRef, { count: newCount });
                }
                
                return `REG-${currentYear}-${String(newCount).padStart(4, '0')}`;
            });
            
            setRegistrationNumber(newRegNumber);

            const registrationData: Omit<ExamRegistration, 'id'> = {
                ...data,
                dob: format(data.dob, 'yyyy-MM-dd'),
                registrationNumber: newRegNumber,
                registeredAt: serverTimestamp(),
            };

            await setDoc(doc(db, "examRegistrations", user.uid), registrationData);

            toast({
                title: "Registration Successful!",
                description: `Your registration number is ${newRegNumber}. Please save it for future reference.`,
            });
            setRegistrationSuccess(true);
            form.reset();

        } catch (error) {
            console.error("Registration failed:", error);
            toast({
                title: "Registration Failed",
                description: "An unexpected error occurred. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    if (userLoading) {
        return (
             <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }
    
    if (isAlreadyRegistered) {
        return <ProfilePage />;
    }

    if (registrationSuccess) {
        return (
             <div className="bg-secondary">
                <div className="container flex items-center justify-center min-h-[80vh]">
                    <Card className="w-full max-w-md text-center shadow-2xl">
                        <CardHeader>
                            <CardTitle className="text-2xl font-headline text-green-600">Registration Successful!</CardTitle>
                            <CardDescription>Your registration number has been generated.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Please save this number for future reference:</p>
                            <div className="my-4 p-4 bg-primary/10 border-2 border-dashed border-primary rounded-lg">
                                <p className="text-2xl font-bold text-primary tracking-widest">{registrationNumber}</p>
                            </div>
                            <Button asChild className="mt-6">
                                <Link href="/profile">View My Profile</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="bg-background">
                <div className="container py-16 sm:py-24 text-center">
                    <h1 className="font-headline text-4xl font-bold text-primary sm:text-5xl">Exam Registration</h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-primary/80">
                        Fill out the form below to register for the upcoming examination.
                    </p>
                </div>
            </div>
            <div className="bg-secondary relative">
                <SectionDivider style="wave" className="text-background" position="top"/>
                <div className="container py-16 sm:py-24">
                     <Card className="max-w-4xl mx-auto shadow-lg">
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">Student Details</CardTitle>
                            <CardDescription>Please fill in all fields accurately.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <FormField
                                            control={form.control}
                                            name="fullName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Full Name</FormLabel>
                                                    <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="fatherName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Father's Name</FormLabel>
                                                    <FormControl><Input placeholder="Richard Doe" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="phone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Phone Number</FormLabel>
                                                    <FormControl><Input type="tel" placeholder="9876543210" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email Address</FormLabel>
                                                    <FormControl><Input type="email" placeholder="user@example.com" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="dob"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col">
                                                    <FormLabel>Date of Birth</FormLabel>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                    variant={"outline"}
                                                                    className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                                                >
                                                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                </Button>
                                                            </FormControl>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0" align="start">
                                                            <Calendar
                                                                mode="single"
                                                                captionLayout="dropdown-buttons"
                                                                fromYear={new Date().getFullYear() - 100}
                                                                toYear={new Date().getFullYear()}
                                                                selected={field.value}
                                                                onSelect={field.onChange}
                                                                disabled={(date) => date > new Date() || date < new Date("1924-01-01")}
                                                                initialFocus
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="gender"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Gender</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl><SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="Male">Male</SelectItem>
                                                            <SelectItem value="Female">Female</SelectItem>
                                                            <SelectItem value="Other">Other</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                         <FormField
                                            control={form.control}
                                            name="course"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Course / Test Name</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder={coursesLoading ? "Loading courses..." : "Select a course or test"} />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {courses.map(course => (
                                                                <SelectItem key={course.id} value={course.title}>
                                                                    {course.title}
                                                                </SelectItem>
                                                            ))}
                                                            <SelectItem value="Other">Other</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="address"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Full Address</FormLabel>
                                                    <FormControl><Input placeholder="Village, Post" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="city"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>City</FormLabel>
                                                    <FormControl><Input placeholder="Patti" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="state"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>State</FormLabel>
                                                    <FormControl><Input placeholder="Uttar Pradesh" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="pinCode"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Pin Code</FormLabel>
                                                    <FormControl><Input type="number" placeholder="230135" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {isLoading ? 'Registering...' : 'Submit Registration'}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                     </Card>
                </div>
            </div>
        </>
    );
}
