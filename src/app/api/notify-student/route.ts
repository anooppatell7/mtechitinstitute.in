
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("LOG: Request received for studentId:", body.studentId);

    const { studentId, title, message } = body;

    // Using direct keys for reliability, bypassing potential process.env issues on server.
    const appId = "5f5c7586-edd7-4b3d-aa11-50922c1d3c4f";
    const restKey = "os_v2_app_l5ohlbxn25ft3kqrkcjcyhj4j4mx7ddsz6luc7vtt4s3wntqg2utk2aleljyxjcge45rxffnj4vpyng5qutuqqyzpokvhm33ochg3dq";

    if (!studentId) {
       console.log("LOG: CRASH ERROR: Student ID is missing in request body.");
       return NextResponse.json({ error: "Student ID is missing" }, { status: 400 });
    }

    const studentRef = doc(db, "examRegistrations", studentId);
    const studentSnap = await getDoc(studentRef);

    if (!studentSnap.exists()) {
      console.log("LOG: Student ID not found in Firebase:", studentId);
      return NextResponse.json({ error: "Student not found in DB" }, { status: 404 });
    }

    const playerID = studentSnap.data().onesignal_player_id;
    console.log("LOG: Player ID found:", playerID);

    if (!playerID) {
       console.log("LOG: No Player ID found for this student in Firestore document.");
       return NextResponse.json({ error: "No Player ID for this student" }, { status: 400 });
    }

    const osResponse = await fetch("https://onesignal.com/api/v1/notifications", {
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

    const osResult = await osResponse.json();
    console.log("LOG: OneSignal API Result:", osResult);
    
    if (!osResponse.ok) {
        console.log("LOG: OneSignal API returned an error status.", osResponse.status, osResult);
    }

    return NextResponse.json({ success: true, result: osResult });

  } catch (error: any) {
    console.error("LOG: CRASH ERROR:", error.message);
    return NextResponse.json({ error: "Internal Server Error: " + error.message }, { status: 500 });
  }
}
