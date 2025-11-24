
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import type { Review } from "@/lib/types";
import type { Metadata } from 'next';
import ReviewPageClient from "@/components/reviews-page-client";
import SectionDivider from "@/components/section-divider";

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

// This forces the page to be dynamically rendered
export const revalidate = 0;

async function getApprovedReviews(): Promise<Review[]> {
  const reviewsQuery = query(
    collection(db, "reviews"),
    orderBy("submittedAt", "desc")
  );
  const reviewsSnapshot = await getDocs(reviewsQuery);
  const reviewList = reviewsSnapshot.docs
    .map(doc => {
        const data = doc.data();
        return { 
            id: doc.id,
            ...data,
            submittedAt: data.submittedAt?.toDate().toLocaleDateString() || new Date().toLocaleDateString(),
        } as Review
    })
    .filter(review => review.isApproved);
  return reviewList;
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
