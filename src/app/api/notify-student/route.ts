
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const { studentId, title, message } = await req.json();

    if (!studentId || !title || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const APP_ID = "5f5c7586-edd7-4b3d-aa11-50922c1d3c4f";
    const API_KEY = process.env.ONESIGNAL_V2_API_KEY; 

    // Firebase Check
    const studentRef = doc(db, "examRegistrations", studentId);
    const studentSnap = await getDoc(studentRef);

    if (!studentSnap.exists()) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const playerId = studentSnap.data().onesignal_player_id;
    if (!playerId) {
      return NextResponse.json({ error: "Player ID missing" }, { status: 400 });
    }

    console.log("ONESIGNAL KEY EXISTS:", !!process.env.ONESIGNAL_V2_API_KEY);

    const res = await fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        app_id: APP_ID,
        target_channel: "push",
        include_player_ids: [playerId],
        headings: { en: title },
        contents: { en: message }
      })
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: "OneSignal error", data }, { status: res.status });
    }

    return NextResponse.json({ success: true, data });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
