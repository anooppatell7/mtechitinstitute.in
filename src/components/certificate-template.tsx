import React from 'react';
import type { ExamResult } from '@/lib/types';

interface CertificateData extends Omit<ExamResult, 'id' | 'submittedAt' | 'responses' | 'timeTaken'> {
  certificateId: string;
  issueDate: string;
  examDate: string;
  percentage: number;
  logoUrl: string;
  directorSignUrl: string;
  controllerSignUrl: string;
}

// NOTE: This component is designed to be rendered to a static string for PDF generation.
// It uses inline styles because Tailwind classes won't be available in the jsPDF environment.
// Ensure all assets (images, fonts) are loaded with absolute URLs or are base64 encoded.
export default function CertificateTemplate(data: CertificateData) {

    // Styles are defined inline for compatibility with html2canvas and jsPDF
    const styles = {
        page: {
            width: '1123px',
            height: '794px',
            padding: '75px',
            boxSizing: 'border-box' as 'border-box',
            backgroundColor: '#ffffff',
            fontFamily: 'Helvetica, Arial, sans-serif',
            color: '#333',
            position: 'relative' as 'relative',
            display: 'flex',
            flexDirection: 'column' as 'column',
        },
        watermark: {
            position: 'absolute' as 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: 0.08,
            width: '450px',
            height: '450px',
            zIndex: 1,
        },
        content: {
            position: 'relative' as 'relative',
            zIndex: 2,
            textAlign: 'center' as 'center',
            display: 'flex',
            flexDirection: 'column' as 'column',
            justifyContent: 'center',
            height: '100%',
        },
        border: {
            position: 'absolute' as 'absolute',
            top: '38px',
            left: '38px',
            right: '38px',
            bottom: '38px',
            border: '2px solid #30475E',
            boxSizing: 'border-box' as 'border-box',
            padding: '19px',
            borderStyle: 'double' as 'double',
            borderColor: '#30475E',
            borderWidth: '5px',
        },
        logo: {
            width: '132px',
            height: '132px',
            margin: '0 auto 10px',
        },
        mainTitle: {
            fontFamily: '"Times New Roman", Times, serif',
            fontSize: '28pt',
            fontWeight: 'bold' as 'bold',
            color: '#30475E',
            margin: '0 0 5px 0',
        },
        subtitle: {
            fontSize: '14pt',
            color: '#555',
            margin: '0 0 15px 0',
            letterSpacing: '1px',
        },
        divider: {
            width: '100px',
            height: '2px',
            backgroundColor: '#2E8B57',
            margin: '0 auto 20px',
        },
        bodyText: {
            fontSize: '12pt',
            lineHeight: 1.6,
            color: '#444',
            marginBottom: '20px',
        },
        studentName: {
            fontFamily: '"Times New Roman", Times, serif',
            fontSize: '24pt',
            fontWeight: 'bold' as 'bold',
            color: '#2E8B57',
            margin: '10px 0',
        },
        courseName: {
            fontSize: '14pt',
            fontWeight: 'bold' as 'bold',
            color: '#30475E',
        },
        signatureContainer: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            width: '100%',
            marginTop: 'auto',
            paddingTop: '40px',
            position: 'relative' as 'relative',
            zIndex: 2,
        },
        signatureBlock: {
            width: '45%',
            textAlign: 'center' as 'center',
            fontSize: '10pt',
        },
        signatureImage: {
            height: '68px',
            width: 'auto',
            marginBottom: '5px',
        },
        signatureLine: {
            borderTop: '1px solid #333',
            margin: '0 auto',
            width: '80%',
        },
        signatureTitle: {
            marginTop: '5px',
            fontWeight: 'bold' as 'bold',
            color: '#30475E',
        },
        footer: {
            textAlign: 'center' as 'center',
            fontSize: '9pt',
            color: '#777',
            marginTop: '20px',
            position: 'relative' as 'relative',
            zIndex: 2,
            width: '100%',
        },
        certId: {
            position: 'absolute' as 'absolute',
            bottom: '-25px',
            left: '5px',
            fontSize: '8pt',
            color: '#999',
        },
        issueDate: {
            position: 'absolute' as 'absolute',
            bottom: '-25px',
            right: '5px',
            fontSize: '8pt',
            color: '#999',
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.border}>
                <img src={data.logoUrl} style={styles.watermark} alt="Watermark" />
                <div style={styles.content}>
                    <div>
                        <img src={data.logoUrl} style={styles.logo} alt="MTech IT Institute Logo" />
                        <h1 style={styles.mainTitle}>Certificate of Completion</h1>
                        <h2 style={styles.subtitle}>PROUDLY PRESENTED TO</h2>
                        <div style={styles.divider}></div>
                        <p style={styles.bodyText}>This is to certify that</p>
                        <p style={styles.studentName}>{data.studentName}</p>
                        <p style={styles.bodyText}>
                            has successfully completed the course
                            <br />
                            <span style={styles.courseName}>{data.testName}</span>
                            <br />
                            with a score of <strong>{data.score} / {data.totalMarks} ({data.percentage.toFixed(2)}%)</strong> on {data.examDate}.
                        </p>
                    </div>
                </div>
                 <div style={styles.signatureContainer}>
                    <div style={styles.signatureBlock}>
                        <img src={data.directorSignUrl} style={styles.signatureImage} alt="Director's Signature" />
                        <div style={styles.signatureLine}></div>
                        <p style={styles.signatureTitle}>Director</p>
                    </div>
                    <div style={styles.signatureBlock}>
                        <img src={data.controllerSignUrl} style={styles.signatureImage} alt="Exam Controller's Signature" />
                        <div style={styles.signatureLine}></div>
                        <p style={styles.signatureTitle}>Exam Controller</p>
                    </div>
                </div>
                 <div style={styles.footer}>
                    <p>MTech IT Institute | www.mtechitinstitute.in</p>
                     <p style={styles.certId}>Certificate ID: {data.certificateId}</p>
                     <p style={styles.issueDate}>Issued on: {data.issueDate}</p>
                </div>
            </div>
        </div>
    );
}
