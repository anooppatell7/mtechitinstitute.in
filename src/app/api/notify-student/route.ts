
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const { studentId, title, message } = await req.json();

    if (!studentId || !title || !message) {
        return NextResponse.json({ error: 'Missing required fields: studentId, title, message' }, { status: 400 });
    }

    const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
    const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;

    if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
        console.error("OneSignal environment variables are not set.");
        return NextResponse.json({ error: 'Server configuration error for notifications.' }, { status: 500 });
    }

    // 1. Firebase se student ka data nikaalein
    const studentRef = doc(db, "examRegistrations", studentId);
    const studentSnap = await getDoc(studentRef);

    if (!studentSnap.exists()) {
      return NextResponse.json({ error: 'Student record not found in database.' }, { status: 404 });
    }

    const studentData = studentSnap.data();
    // Screenshot ke mutabiq sahi field
    const playerID = studentData.onesignal_player_id; 

    if (!playerID) {
      return NextResponse.json({ error: 'OneSignal Player ID is missing in database for this student.' }, { status: 400 });
    }

    // 2. OneSignal ko notification bhejein (Direct Fetch Method)
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": `Basic ${ONESIGNAL_REST_API_KEY}` // Yahan Basic likhna zaroori hai
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        include_player_ids: [playerID], // ID ko array mein bhejna zaroori hai
        headings: { en: title },
        contents: { en: message },
        android_accent_color: "FF0000FF", // Accent color for notification
        priority: 10
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("OneSignal Error Response:", result);
      return NextResponse.json({ error: 'OneSignal rejected the notification', details: result }, { status: response.status });
    }

    return NextResponse.json({ success: true, result });

  } catch (error: any) {
    console.error("Critical Backend Error:", error);
    return NextResponse.json({ error: "Internal Server Error", message: error.message }, { status: 500 });
  }
}
