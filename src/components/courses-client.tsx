
"use client";

import React, { useState, useMemo } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Clock, IndianRupee, BookOpen, Tag, X, Search, CheckCircle } from "lucide-react";
import Image from "next/image";
import type { Course } from "@/lib/types";
import { EnrollModal } from "@/components/enroll-modal";
import { courseSchema } from "@/lib/schema";
import { JsonLd } from "@/components/json-ld";

export default function CoursesClient({ courses }: { courses: Course[] }) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredCourses = useMemo(() => {
        if (!searchTerm) {
            return courses;
        }
        return courses.filter(course =>
            course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [courses, searchTerm]);


    return (
        <>
        <div className="mb-8 max-w-lg mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-base"
            />
            {searchTerm && (
                <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setSearchTerm('')}>
                    <X className="h-5 w-5" />
                </Button>
            )}
        </div>
        
        {filteredCourses.length > 0 ? (
            <div className="space-y-12">
            {filteredCourses.map((course) => (
                <React.Fragment key={course.id}>
                <JsonLd data={courseSchema(course)} />
                <Card className="overflow-hidden shadow-lg grid grid-cols-1 md:grid-cols-2">
                    <div className="relative min-h-[250px] md:min-h-full">
                    <Image
                        src={course.image}
                        alt={`${course.title} course banner`}
                        data-ai-hint={course.title.split(' ').slice(0,2).join(' ').toLowerCase()}
                        fill
                        className="object-cover"
                    />
                    </div>
                    <div className="p-6 md:p-8 flex flex-col">
                    <CardHeader className="p-0">
                        <CardTitle className="font-headline text-2xl mb-2 text-primary">{course.title} Course</CardTitle>
                        <CardDescription>{course.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 mt-4 flex-grow">
                        <div className="flex items-center justify-between text-muted-foreground text-sm mb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>Duration: {course.duration}</span>
                            </div>
                             {course.eligibility && (
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4" />
                                    <span>Eligibility: {course.eligibility}</span>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2 font-semibold text-lg text-primary">
                            {course.actualPrice && (
                                <span className="flex items-center text-base text-muted-foreground line-through">
                                <IndianRupee className="h-4 w-4" /> {course.actualPrice}
                                </span>
                            )}
                            <span className="flex items-center text-accent">
                                <Tag className="h-5 w-5 mr-1" />
                                <IndianRupee className="h-5 w-5" /> {course.discountPrice}
                            </span>
                        </div>
                        </div>
                        <Accordion type="single" collapsible>
                        <AccordionItem value="item-1">
                            <AccordionTrigger className="text-base font-semibold">
                            <div className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5" />
                                <span>View Syllabus</span>
                            </div>
                            </AccordionTrigger>
                            <AccordionContent>
                            <ul className="list-disc pl-6 space-y-1 mt-2 text-foreground/80">
                                {Array.isArray(course.syllabus) ? (
                                    course.syllabus.map((item, i) => (
                                    <li key={i}>{item}</li>
                                    ))
                                ) : (
                                    <li>Syllabus not available.</li>
                                )}
                            </ul>
                            </AccordionContent>
                        </AccordionItem>
                        </Accordion>
                    </CardContent>
                    <CardFooter className="p-0 mt-6">
                        <EnrollModal>
                            <Button className="w-full" size="lg">Enroll Now</Button>
                        </EnrollModal>
                    </CardFooter>
                    </div>
                </Card>
                </React.Fragment>
            ))}
            </div>
         ) : (
            <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">No courses found matching your search.</p>
            </div>
         )}
        </>
    );
}
