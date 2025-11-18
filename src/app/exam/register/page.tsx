
"use client";

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';

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

const formSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters."),
  fatherName: z.string().min(3, "Father's name must be at least 3 characters."),
  phone: z.string().min(10, "Please enter a valid 10-digit phone number.").max(10),
  email: z.string().email("Please enter a valid email address."),
  dob: z.date({ required_error: "Date of birth is required." }),
  gender: z.enum(['Male', 'Female', 'Other']),
  course: z.string().min(1, "Please select a course."),
  address: z.string().min(5, "Address must be at least 5 characters."),
  city: z.string().min(2, "City is required."),
  state: z.string().min(2, "State is required."),
  pinCode: z.string().length(6, "Pin code must be 6 digits."),
  photo: z.any().refine(file => file.length == 1, "Photo is required.").refine(file => file[0]?.size <= 2000000, `Max file size is 2MB.`)
});

type FormData = z.infer<typeof formSchema>;

export default function ExamRegistrationPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const [registrationNumber, setRegistrationNumber] = useState('');
    const { toast } = useToast();

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: '',
            fatherName: '',
            phone: '',
            email: '',
            address: '',
            city: '',
            state: '',
            pinCode: '',
            photo: undefined,
        }
    });

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        setIsLoading(true);
        try {
            const photoFile = data.photo[0];
            const storage = getStorage();
            const photoRef = ref(storage, `exam_photos/${Date.now()}_${photoFile.name}`);
            const snapshot = await uploadBytes(photoRef, photoFile);
            const photoUrl = await getDownloadURL(snapshot.ref);

            // Generate Registration Number
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

            const registrationData = {
                ...data,
                dob: format(data.dob, 'yyyy-MM-dd'),
                photoUrl,
                registrationNumber: newRegNumber,
                registeredAt: serverTimestamp(),
            };
            delete (registrationData as any).photo;

            await addDoc(collection(db, "examRegistrations"), registrationData);

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
                            <p className="text-muted-foreground">Please save this number for the exam:</p>
                            <div className="my-4 p-4 bg-primary/10 border-2 border-dashed border-primary rounded-lg">
                                <p className="text-2xl font-bold text-primary tracking-widest">{registrationNumber}</p>
                            </div>
                            <Button asChild className="mt-6">
                                <Link href="/exam/start">Proceed to Exam</Link>
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
                                                                selected={field.value}
                                                                onSelect={field.onChange}
                                                                disabled={(date) => date > new Date() || date < new Date("1950-01-01")}
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
                                                        <FormControl><SelectTrigger><SelectValue placeholder="Select a course or test" /></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="CCC">CCC</SelectItem>
                                                            <SelectItem value="ADCA">ADCA</SelectItem>
                                                            <SelectItem value="O-Level">O-Level</SelectItem>
                                                            <SelectItem value="Tally">Tally</SelectItem>
                                                            <SelectItem value="Web Development">Web Development</SelectItem>
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
                                        <FormField
                                          control={form.control}
                                          name="photo"
                                          render={({ field }) => (
                                            <FormItem>
                                              <FormLabel>Upload Photo</FormLabel>
                                              <FormControl>
                                                <Input type="file" accept="image/png, image/jpeg, image/jpg" {...form.register('photo')} />
                                              </FormControl>
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

