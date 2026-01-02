
"use client";

import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import type { SiteSettings, PopupSettings } from "./types";

// This file is now the central place for client-side Firebase utility functions.

/**
 * Fetches the site-wide announcement settings from Firestore.
 * @returns A promise that resolves to the SiteSettings object or null if not found.
 */
export async function getSiteSettings(): Promise<SiteSettings | null> {
    if (!db) {
        console.error("Firestore is not initialized.");
        return null;
    }
    try {
        const docRef = doc(db, "site_settings", "announcement");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data() as SiteSettings;
        } else {
            console.log("No announcement settings found in Firestore.");
            return null;
        }
    } catch (error) {
        console.error("Error fetching site settings:", error);
        return null;
    }
}

/**
 * Fetches the promotional popup settings from Firestore.
 * @returns A promise that resolves to the PopupSettings object or null if not found.
 */
export async function getPopupSettings(): Promise<PopupSettings | null> {
    if (!db) {
        console.error("Firestore is not initialized.");
        return null;
    }
    try {
        const docRef = doc(db, "site_settings", "salesPopup");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data() as PopupSettings;
        } else {
            console.log("No popup settings found in Firestore.");
            return null;
        }
    } catch (error) {
        console.error("Error fetching popup settings:", error);
        return null;
    }
}
