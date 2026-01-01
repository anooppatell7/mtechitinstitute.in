
import { NextRequest, NextResponse } from 'next/server';
import * as OneSignal from 'onesignal-node';
import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  const { studentId, title, message } = await req.json();

  if (!studentId || !title || !message) {
    return NextResponse.json({ success: false, error: 'Missing required fields: studentId, title, message' }, { status: 400 });
  }

  const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
  const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;

  if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
    console.error("OneSignal environment variables are not set.");
    return NextResponse.json({ success: false, error: 'Server configuration error for notifications.' }, { status: 500 });
  }

  try {
    // 1. Fetch the student's document to get the OneSignal Player ID
    const studentRef = doc(db, "examRegistrations", studentId);
    const studentSnap = await getDoc(studentRef);

    if (!studentSnap.exists()) {
      return NextResponse.json({ success: false, error: 'Student not found.' }, { status: 404 });
    }

    const studentData = studentSnap.data();
    const playerID = studentData.onesignal_player_id;

    if (!playerID) {
      return NextResponse.json({ success: false, error: 'OneSignal Player ID not found for this student.' }, { status: 404 });
    }

    // 2. Setup OneSignal Client
    const client = new OneSignal.Client(ONESIGNAL_APP_ID, ONESIGNAL_REST_API_KEY);

    // 3. Create the notification object
    const notification = {
      contents: { 'en': message },
      headings: { 'en': title },
      include_player_ids: [playerID],
    };

    // 4. Send the notification
    const response = await client.createNotification(notification);
    
    return NextResponse.json({ success: true, response: response.body });

  } catch (error: any) {
    console.error('OneSignal API Error:', error);
    let errorMessage = 'Failed to send notification.';
    if (error instanceof OneSignal.OneSignalError) {
      errorMessage = error.message;
    }
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
