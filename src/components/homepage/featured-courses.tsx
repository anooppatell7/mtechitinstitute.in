
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import CourseCard from "@/components/course-card";
import { db } from "@/firebase";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import type { Course } from "@/lib/types";
import { useEffect, useState } from "react";


export default function FeaturedCourses() {
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getFeaturedCourses() {
        try {
            if (!db) {
                console.error('DB not ready.');
                setLoading(false);
                return;
            }
            const coursesQuery = query(
                collection(db, "courses"), 
                where("isFeatured", "==", true), 
                limit(3)
            );
            const courseSnapshot = await getDocs(coursesQuery);
            
            if (courseSnapshot.empty) {
                console.log('No featured courses found in Firestore.');
                setFeaturedCourses([]);
            } else {
                const courseList = courseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
                setFeaturedCourses(courseList);
            }
        } catch (error) {
            console.error("Error fetching featured courses:", error);
            setFeaturedCourses([]);
        } finally {
            setLoading(false);
        }
    }
    getFeaturedCourses();
  }, []);

  if (loading) {
      return (
          <section className="py-16 sm:py-24 bg-secondary/50">
            <div className="container">
                <div className="text-center mb-12">
                    <h2 className="font-headline text-3xl font-bold text-primary sm:text-4xl">Our Popular Courses</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-foreground/80">
                        Loading our most sought-after courses...
                    </p>
                </div>
            </div>
          </section>
      )
  }
  
  if (featuredCourses.length === 0) {
      return null; // Don't render the section if there are no featured courses
  }


  return (
    <section className="py-16 sm:py-24 bg-secondary/50">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-headline text-3xl font-bold text-primary sm:text-4xl">Our Popular Courses</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-foreground/80">
            Explore our most sought-after courses designed to kickstart your career in IT.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredCourses.map((course, index) => (
            <CourseCard key={course.id || index} course={course} />
          ))}
        </div>
        <div className="mt-12 text-center">
          <Button asChild size="lg" variant="outline">
            <Link href="/courses">View All Courses</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
