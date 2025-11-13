
import React from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import type { Course } from "@/lib/types";
import type { Metadata } from "next";
import CoursesClient from "@/components/courses-client";
import SectionDivider from "@/components/section-divider";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mtechitinstitute.in";

export const metadata: Metadata = {
  title: "IT & Computer Courses in Patti, Pratapgarh - MTech IT Institute",
  description: "Explore top IT & computer courses like Web Development, Digital Marketing, Tally, CCC, O-Level in Patti. Get expert training at MTech IT Institute.",
  keywords: ["computer courses patti", "IT courses pratapgarh", "web development course", "digital marketing course", "Tally course", "CCC course", "O-Level course", "job oriented courses after 12th"],
  alternates: {
    canonical: `${siteUrl}/courses`,
  },
  openGraph: {
    title: "IT & Computer Courses in Patti, Pratapgarh - MTech IT Institute",
    description: "Explore top IT & computer courses like Web Development, Digital Marketing, Tally, CCC, O-Level in Patti. Get expert training at MTech IT Institute.",
    url: `${siteUrl}/courses`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "IT & Computer Courses in Patti, Pratapgarh - MTech IT Institute",
    description: "Explore top IT & computer courses like Web Development, Digital Marketing, Tally, CCC, O-Level in Patti. Get expert training at MTech IT Institute.",
  },
};

// This forces the page to be dynamically rendered
export const revalidate = 0;

async function getCourses(): Promise<Course[]> {
    const coursesCollection = collection(db, "courses");
    const courseSnapshot = await getDocs(coursesCollection);
    const courseList = courseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
    return courseList;
}

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <>
      <div className="bg-background">
        <div className="container py-16 sm:py-24 text-center">
          <h1 className="font-headline text-4xl font-bold text-primary sm:text-5xl">Our Professional IT Courses</h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-foreground/80">
            Find the perfect job-oriented computer course in Patti to advance your skills and launch your career in the tech industry.
          </p>
        </div>
      </div>
      
      <div className="bg-secondary relative">
        <SectionDivider style="wave" className="text-background" position="top"/>
        <div className="container py-16 sm:py-24">
          <CoursesClient courses={courses} />
        </div>
      </div>
    </>
  );
}
