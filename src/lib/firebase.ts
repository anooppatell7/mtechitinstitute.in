
"use client";

// This file is deprecated. Please use imports from "@/firebase" instead.

import { db, auth } from "@/firebase";

export { db, auth };

export async function getSiteSettings() {
    console.warn("getSiteSettings from lib/firebase is deprecated.");
    return null;
}
export async function getPopupSettings() {
    console.warn("getPopupSettings from lib/firebase is deprecated.");
    return null;
}
