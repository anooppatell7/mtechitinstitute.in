
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


export default function ReviewsPage() {
  
  return (
    <>
      <div className="bg-gradient-to-br from-indigo-600 via-blue-500 to-cyan-400">
        <ReviewPageClient />
      </div>
      <div className="relative bg-secondary">
          <SectionDivider style="wave" className="text-gradient-to-br from-indigo-600 via-blue-500 to-cyan-400" position="top"/>
          <div className="h-24"></div>
      </div>
    </>
  )
}
