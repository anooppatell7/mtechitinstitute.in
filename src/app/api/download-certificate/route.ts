
import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { generateCertificatePdf } from '@/lib/certificate-generator';
import type { ExamResult } from '@/lib/types';
import { format } from 'date-fns';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const resultId = searchParams.get('resultId');

  if (!resultId) {
    return NextResponse.json({ error: 'Result ID is required' }, { status: 400 });
  }

  try {
    const resultRef = doc(db, 'examResults', resultId);
    const resultSnap = await getDoc(resultRef);

    if (!resultSnap.exists()) {
      return NextResponse.json({ error: 'Exam result not found' }, { status: 404 });
    }

    const result = resultSnap.data() as ExamResult;
    
    if (!result.certificateId) {
        return NextResponse.json({ error: 'Certificate ID is missing for this result' }, { status: 400 });
    }

    const percentage = result.totalMarks > 0 ? (result.score / result.totalMarks) * 100 : 0;
    
    const certificateData = {
        studentName: result.studentName,
        registrationNumber: result.registrationNumber,
        testName: result.testName,
        score: result.score,
        totalMarks: result.totalMarks,
        accuracy: result.accuracy,
        userId: result.userId,
        testId: result.testId,
        certificateId: result.certificateId,
        percentage: parseFloat(percentage.toFixed(2)),
        issueDate: format(new Date(), 'yyyy-MM-dd'),
        examDate: format(result.submittedAt.toDate(), 'yyyy-MM-dd'),
    };
    
    // Generate the PDF using the server-side function
    const pdf = await generateCertificatePdf(certificateData);
    const pdfBuffer = pdf.output('arraybuffer');

    // Return the PDF as a response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Certificate-${result.studentName.replace(/ /g, '_')}.pdf"`,
      },
    });

  } catch (error: any) {
    console.error('Certificate generation error in API route:', error);
    return NextResponse.json(
      { error: 'Failed to generate certificate', details: error.message },
      { status: 500 }
    );
  }
}
