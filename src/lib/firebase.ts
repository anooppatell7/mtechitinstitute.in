

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, orderBy, doc, getDoc, setDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import type { BlogPost, SiteSettings, UserProgress, TestResult, ExamResult, Certificate, PopupSettings } from "./types";
import { initializeFirebase } from "@/firebase/index";


// NOTE: This file is now deprecated in favor of the new src/firebase/index.ts setup.
// It is kept for reference but new imports should point to the new structure.
// The core logic has been moved to src/firebase/index.ts and related provider files.

const { db, auth, storage } = initializeFirebase();


export async function getBlogPostsByCategory(category: string): Promise<BlogPost[]> {
    const blogQuery = query(
        collection(db, "blog"),
        where("category", "==", category)
    );
    const blogSnapshot = await getDocs(blogQuery);
    let posts = blogSnapshot.docs.map(doc => ({ slug: doc.id, ...doc.data() } as BlogPost));

    // Sort by date in descending order (newest first)
    posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return posts;
}

export async function getPostsByTag(tag: string): Promise<BlogPost[]> {
    const q = query(collection(db, "blog"), where("tags", "array-contains", tag));
    const querySnapshot = await getDocs(q);
    const posts = querySnapshot.docs.map(doc => {
         const data = doc.data() as Omit<BlogPost, 'slug' | 'summary'>;
        const snippet = data.content.replace(/<[^>]+>/g, '').substring(0, 150);
        return { 
            ...data, 
            slug: doc.id,
            summary: `${snippet}...` 
        } as BlogPost;
    });

     // Sort by date in descending order (newest first)
    posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return posts;
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
    try {
        const docRef = doc(db, 'site_settings', 'announcement');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as SiteSettings;
        }
        return null;
    } catch (error) {
        console.error("Error fetching site settings:", error);
        return null;
    }
}

export async function getPopupSettings(): Promise<PopupSettings | null> {
    try {
        const docRef = doc(db, 'site_settings', 'salesPopup');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as PopupSettings;
        }
        return null;
    } catch (error) {
        console.error("Error fetching popup settings:", error);
        return null;
    }
}


export async function getUserProgress(userId: string): Promise<UserProgress | null> {
    if (!userId) return null;
    try {
        const docRef = doc(db, 'userProgress', userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as UserProgress;
        }
        return {}; // Return empty object if no progress found
    } catch (error) {
        console.error("Error fetching user progress:", error);
        return null;
    }
}

export async function updateUserProgress(userId: string, progress: UserProgress): Promise<void> {
     if (!userId) return;
     try {
        const docRef = doc(db, 'userProgress', userId);
        await setDoc(docRef, progress, { merge: true });
     } catch (error) {
        console.error("Error updating user progress:", error);
     }
}

export async function saveExamResult(result: Omit<ExamResult, 'id' | 'submittedAt'>): Promise<string> {
    const resultWithTimestamp = {
        ...result,
        submittedAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, 'examResults'), resultWithTimestamp);
    return docRef.id;
}

export async function saveCertificate(certificateData: Omit<Certificate, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'certificates'), certificateData);
  return docRef.id;
}

export { db, auth, storage };
