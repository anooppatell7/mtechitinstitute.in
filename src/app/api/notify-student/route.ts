
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentId, title, message } = body;

    // Hardcoded keys to eliminate environment variable issues.
    const appId = "5f5c7586-edd7-4b3d-aa11-50922c1d3c4f"; 
    const restKey = "os_v2_app_l5ohlbxn25ft3kqrkcjcyhj4j4mx7ddsz6luc7vtt4s3wntqg2utk2aleljyxjcge45rxffnj4vpyng5qutuqqyzpokvhm33ochg3dq"; 

    if (!studentId) {
      return NextResponse.json({ error: "Student ID is missing" }, { status: 400 });
    }

    // Fetch the student's document to get the OneSignal Player ID
    const studentRef = doc(db, "examRegistrations", studentId);
    const studentSnap = await getDoc(studentRef);

    if (!studentSnap.exists()) {
      return NextResponse.json({ error: `Student ID ${studentId} not found in Firestore` }, { status: 404 });
    }

    const playerID = studentSnap.data().onesignal_player_id;

    if (!playerID) {
      return NextResponse.json({ error: "onesignal_player_id is empty in the database for this student." }, { status: 400 });
    }

    // OneSignal API call using Fetch
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
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
    
    if (!response.ok) {
      console.error("OneSignal API Error:", result);
      return NextResponse.json({ error: "OneSignal API request failed", details: result }, { status: response.status });
    }

    return NextResponse.json({ success: true, result });

  } catch (error: any) {
    console.error("Critical Backend Error:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      message: error.message, 
      stack: error.stack 
    }, { status: 500 });
  }
}
