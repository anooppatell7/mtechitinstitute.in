
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import type { MockTest, TestResult } from "@/lib/types";
import type { Metadata } from 'next';
import MockTestsClient from "@/components/mock-tests-client";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { useUser } from "@/firebase";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mtechitinstitute.in";

export const metadata: Metadata = {
  title: "Mock Tests - MTech IT Institute",
  description: "Test your skills with our online mock tests. Prepare for exams and real-world scenarios with timed practice tests on various IT subjects.",
  keywords: ["mock tests", "online practice tests", "it exam preparation", "coding quiz", "programming tests"],
   alternates: {
    canonical: `${siteUrl}/mock-tests`,
  },
   openGraph: {
    title: "Mock Tests - MTech IT Institute",
    description: "Test your skills with our online mock tests for various IT subjects.",
    url: `${siteUrl}/mock-tests`,
  },
};

// This forces the page to be dynamically rendered
export const revalidate = 0;

async function getPublishedMockTests(): Promise<MockTest[]> {
    const testsQuery = query(
        collection(db, "mockTests"),
        where("isPublished", "==", true)
    );
    const testsSnapshot = await getDocs(testsQuery);
    const testList = testsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MockTest));
    return testList;
}

async function getUserResults(userId: string): Promise<TestResult[]> {
    if (!userId) return [];
    const resultsQuery = query(
        collection(db, 'testResults'),
        where('userId', '==', userId)
    );
    const resultsSnapshot = await getDocs(resultsQuery);
    return resultsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TestResult));
}


export default async function MockTestsPage() {
    const mockTests = await getPublishedMockTests();
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    const userResults = user?.id ? await getUserResults(user.id) : [];

    return (
        <MockTestsClient mockTests={mockTests} userResults={userResults} />
    );
}
