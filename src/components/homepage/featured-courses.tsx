

import Link from "next/link";
import { Button } from "@/components/ui/button";
import CourseCard from "@/components/course-card";
import { db } from "@/lib/firebase";
import { collection, getDocs, limit, query } from "firebase/firestore";
import type { Course } from "@/lib/types";
import marketingCourses from '@/lib/data/marketing-courses.json';


// This forces the component to be dynamically rendered
export const revalidate = 0;

async function getFeaturedCourses(): Promise<Course[]> {
    try {
        const coursesQuery = query(collection(db, "courses"), limit(3));
        const courseSnapshot = await getDocs(coursesQuery);
        
        if (courseSnapshot.empty) {
            console.log('No courses found in Firestore, falling back to local data.');
            // Fallback to local data if Firestore is empty
            return marketingCourses.slice(0, 3) as Course[];
        }

        const courseList = courseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
        return courseList;
    } catch (error) {
        console.error("Error fetching featured courses:", error);
        // Fallback to local data on error
        return marketingCourses.slice(0, 3) as Course[];
    }
}

export default async function FeaturedCourses() {
  const featuredCourses = await getFeaturedCourses();

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


    
