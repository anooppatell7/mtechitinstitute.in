
import type { Metadata } from 'next';
import ReviewPageClient from "@/components/reviews-page-client";
import SectionDivider from "@/components/section-divider";
import { db } from '@/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import type { Review } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mtechitinstitute.in";

export const metadata: Metadata = {
  title: "Student Reviews - MTech IT Institute",
  description: "See what our students are saying! Read reviews and testimonials about our computer courses and training in Patti, Pratapgarh.",
  keywords: ["student reviews mtech it institute", "mtech it institute testimonials", "computer course reviews patti"],
   alternates: {
    canonical: `${siteUrl}/reviews`,
  },
   openGraph: {
    title: "Student Reviews - MTech IT Institute",
    description: "See what our students are saying! Read reviews and testimonials about our computer courses and training.",
    url: `${siteUrl}/reviews`,
  },
};

async function getApprovedReviews(): Promise<Review[]> {
  if (!db) return [];
  try {
    const reviewsQuery = query(
      collection(db, "reviews"),
      where("isApproved", "==", true),
      orderBy("submittedAt", "desc")
    );
    const reviewsSnapshot = await getDocs(reviewsQuery);
    return reviewsSnapshot.docs.map(doc => {
      const data = doc.data();
      // Convert Firestore Timestamp to a readable date string
      const submittedAt = (data.submittedAt as Timestamp)?.toDate().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
      }) || 'Date not available';

      return {
        id: doc.id,
        ...data,
        submittedAt,
      } as Review;
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
}


export default async function ReviewsPage() {
  const reviews = await getApprovedReviews();
  
  return (
    <>
      <div className="bg-gradient-to-br from-indigo-600 via-blue-500 to-cyan-400">
        <ReviewPageClient reviews={reviews} />
      </div>
      <div className="relative bg-secondary">
          <SectionDivider style="wave" className="text-gradient-to-br from-indigo-600 via-blue-500 to-cyan-400" position="top"/>
          <div className="h-24"></div>
      </div>
    </>
  )
}
