
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const { studentId, title, message } = await req.json();

    // 1. ASLI KEYS (Yahan check karein)
    const ONESIGNAL_APP_ID = "5f5c7586-edd7-4b3d-aa11-50922c1d3c4f";
    // Yahan wo lambi key daalein jo "+ Add Key" karne par mili thi
    const ONESIGNAL_REST_API_KEY = "os_v2_app_l5ohlbxn25ft3kqrkcjcyhj4j7rluy4c6ehuj64svdebt7wqebt6outq7kzqsgrkrskqapct56wj4cau4n5mygesk6qwowznjoiqe7q"; 

    // 2. Fetch Player ID from Firebase
    const studentRef = doc(db, "examRegistrations", studentId);
    const studentSnap = await getDoc(studentRef);

    if (!studentSnap.exists()) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const playerID = studentSnap.data().onesignal_player_id;
    if (!playerID) {
      return NextResponse.json({ error: "No Player ID found" }, { status: 400 });
    }

    // 3. OneSignal API Call with proper headers
    const osResponse = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": `Basic ${ONESIGNAL_REST_API_KEY}` // 'Basic' word bahut zaroori hai
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        include_player_ids: [playerID],
        headings: { en: title },
        contents: { en: message }
      })
    });

    const result = await osResponse.json();

    if (!osResponse.ok) {
      return NextResponse.json({ error: "OneSignal API request failed", details: result }, { status: osResponse.status });
    }

    return NextResponse.json({ success: true, result });

  } catch (error: any) {
    return NextResponse.json({ error: "Server Crash", message: error.message }, { status: 500 });
  }
}
