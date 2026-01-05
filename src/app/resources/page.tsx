

"use client";

import { db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";
import type { Resource } from "@/lib/types";
import type { Metadata } from 'next';
import ResourcesClient from "@/components/resources-client";
import SectionDivider from "@/components/section-divider";
import { useEffect, useState } from "react";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mtechitinstitute.in";

const metadata: Metadata = {
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


export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getResources() {
        if (!db) return;
        const resourcesCollection = collection(db, "resources");
        const resourceSnapshot = await getDocs(resourcesCollection);
        const resourceList = resourceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Resource));
        setResources(resourceList);
        setLoading(false);
    }
    getResources();
  }, []);

  return (
    <>
      <head>
          <title>{metadata.title as string}</title>
          <meta name="description" content={metadata.description as string} />
      </head>
      <div className="bg-gradient-to-br from-indigo-600 via-blue-500 to-cyan-400 text-white">
        <div className="container py-16 sm:py-24 text-center">
          <h1 className="font-headline text-4xl font-bold sm:text-5xl">Free Resources<span className="text-green-300">.</span></h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-blue-50">
            Access free materials like PDF notes, worksheets, and quizzes to support your learning journey with us.
          </p>
        </div>
      </div>

      <div className="bg-secondary relative">
        <SectionDivider style="wave" className="text-gradient-to-br from-indigo-600 via-blue-500 to-cyan-400" position="top"/>
        <div className="container py-16 sm:py-24">
          <div className="grid grid-cols-1">
              <main>
                  {loading ? <div>Loading resources...</div> : <ResourcesClient resources={resources} />}
              </main>
          </div>
        </div>
      </div>
    </>
  );
}
