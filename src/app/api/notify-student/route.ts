
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const { studentId, title, message } = await req.json();

    // 1. Correct App ID and REST API Key are hardcoded for reliability.
    const appId = "5f5c7586-edd7-4b3d-aa11-50922c1d3c4f"; 
    
    // The correct, long REST API key is used here directly.
    const restKey = "os_v2_app_l5ohlbxn25ft3kqrkcjcyhj4j5b25xi5ckge624c5ridndvpnvcmwf6fniq5x45dppzn2xrqq6jtysrqzub2eplqx5dbsstiyduwd3q"; 

    if (!studentId) {
      return NextResponse.json({ error: "Student ID is missing from the request body." }, { status: 400 });
    }

    // 2. Fetch the student's document from Firestore to get their OneSignal Player ID.
    const studentRef = doc(db, "examRegistrations", studentId);
    const studentSnap = await getDoc(studentRef);

    if (!studentSnap.exists()) {
      return NextResponse.json({ error: `Student with ID '${studentId}' was not found in the database.` }, { status: 404 });
    }

    const playerID = studentSnap.data().onesignal_player_id;

    if (!playerID) {
      return NextResponse.json({ error: "This student does not have a OneSignal Player ID in the database." }, { status: 400 });
    }

    // 3. Make the API call to OneSignal with the correct headers.
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        // The 'Authorization' header must be in the 'Basic <KEY>' format.
        "Authorization": `Basic ${restKey}` 
      },
      body: JSON.stringify({
        app_id: appId,
        include_player_ids: [playerID],
        headings: { en: title },
        contents: { en: message }
      })
    });

    const result = await response.json();

    // If OneSignal returns an error, forward a descriptive error.
    if (!response.ok) {
      return NextResponse.json({ error: "OneSignal API request failed.", details: result }, { status: response.status });
    }

    return NextResponse.json({ success: true, result });

  } catch (error: any) {
    // Catch any unexpected server crashes.
    return NextResponse.json({ error: "An internal server error occurred.", message: error.message }, { status: 500 });
  }
}
