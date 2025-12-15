
import React from "react";
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


export default function CoursesPage() {

  return (
    <>
      <div className="bg-gradient-to-br from-indigo-600 via-blue-500 to-cyan-400 text-white">
        <div className="container py-16 sm:py-24 text-center">
          <h1 className="font-headline text-4xl font-bold sm:text-5xl">Our Professional IT Courses<span className="text-green-300">.</span></h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-blue-50">
            Find the perfect job-oriented computer course in Patti to advance your skills and launch your career in the tech industry.
          </p>
        </div>
      </div>
      
      <div className="bg-secondary relative">
        <SectionDivider style="wave" className="text-gradient-to-br from-indigo-600 via-blue-500 to-cyan-400" position="top"/>
        <div className="container py-16 sm:py-24">
          <CoursesClient />
        </div>
      </div>
    </>
  );
}
