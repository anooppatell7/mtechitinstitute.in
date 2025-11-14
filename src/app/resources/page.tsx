
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import type { Resource } from "@/lib/types";
import AdPlaceholder from "@/components/ad-placeholder";
import type { Metadata } from 'next';
import ResourcesClient from "@/components/resources-client";
import SectionDivider from "@/components/section-divider";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mtechitinstitute.in";

export const metadata: Metadata = {
  title: "Free Student Resources (PDF, Notes) - MTech IT Institute",
  description: "Access and download free student resources from MTech IT Institute, including PDF notes, worksheets, and quizzes for computer courses in Patti.",
  keywords: ["free student resources", "computer course notes pdf", "it course study material", "mtech it institute resources"],
  alternates: {
    canonical: `${siteUrl}/resources`,
  },
  openGraph: {
    title: "Free Student Resources (PDF, Notes) - MTech IT Institute",
    description: "Access and download free student resources from MTech IT Institute, including PDF notes, worksheets, and quizzes.",
    url: `${siteUrl}/resources`,
  },
};

// This forces the page to be dynamically rendered, ensuring data is always fresh
export const revalidate = 0;

async function getResources(): Promise<Resource[]> {
  const resourcesCollection = collection(db, "resources");
  const resourceSnapshot = await getDocs(resourcesCollection);
  const resourceList = resourceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Resource));
  return resourceList;
}

export default async function ResourcesPage() {
  const resources = await getResources();

  return (
    <>
      <div className="bg-background">
        <div className="container py-16 sm:py-24 text-center">
          <h1 className="font-headline text-4xl font-bold text-primary sm:text-5xl">Free Resources<span className="text-accent">.</span></h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-foreground/80">
            Access free materials like PDF notes, worksheets, and quizzes to support your learning journey with us.
          </p>
        </div>
      </div>

      <div className="bg-secondary relative">
        <SectionDivider style="wave" className="text-background" position="top"/>
        <div className="container py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
              <main className="lg:col-span-3">
                  <ResourcesClient resources={resources} />
              </main>
              <aside className="lg:col-span-1 space-y-8">
                  <AdPlaceholder />
              </aside>
          </div>
        </div>
      </div>
    </>
  );
}
