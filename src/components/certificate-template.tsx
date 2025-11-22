import React from 'react';
import type { ExamResult } from '@/lib/types';

interface CertificateData extends Omit<ExamResult, 'id' | 'submittedAt' | 'responses' | 'timeTaken'> {
  certificateId: string;
  issueDate: string;
  examDate: string;
  percentage: number;
  logoUrl: string;
  watermarkUrl: string;
  goldSealUrl: string;
  signatureUrl: string;
}

export default function CertificateTemplate(data: CertificateData) {

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
    }

    const styles: { [key: string]: React.CSSProperties } = {
        page: {
            width: '1123px',
            height: '794px',
            boxSizing: 'border-box',
            backgroundColor: '#F7F5F2', // Soft paper texture color
            fontFamily: '"Times New Roman", Times, serif',
            color: '#001F54', // Dark Navy Blue
            position: 'relative',
            padding: '25px',
        },
        borderOuter: {
            position: 'absolute',
            top: '25px', left: '25px', right: '25px', bottom: '25px',
            border: '8px solid #001F54',
            padding: '8px',
            boxSizing: 'border-box',
        },
        borderInner: {
            width: '100%', height: '100%',
            border: '2px solid #C9A24B', // Gold color
            boxSizing: 'border-box',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: '20px',
        },
        watermark: {
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: 0.15,
            width: '450px',
            height: '450px',
            zIndex: 1,
        },
        content: {
            width: '100%',
            textAlign: 'center',
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: '10px',
        },
        logo: {
            width: '80px',
            height: '80px',
            marginBottom: '10px',
        },
        instituteName: {
            fontFamily: '"Playfair Display", serif',
            fontSize: '24pt',
            fontWeight: 'bold',
            color: '#001F54',
        },
        mainTitle: {
            fontFamily: '"Playfair Display", serif',
            fontSize: '34pt',
            fontWeight: 'bold',
            color: '#001F54',
            letterSpacing: '1px',
            margin: '5px 0',
        },
        presentedTo: {
            fontSize: '14pt',
            color: '#555',
            margin: '15px 0 5px 0',
            textTransform: 'uppercase',
        },
        certifyText: {
            fontSize: '12pt',
            color: '#333',
            margin: '0 0 -5px 0',
        },
        studentName: {
            fontFamily: '"Great Vibes", cursive',
            fontSize: '52pt',
            fontWeight: 'normal',
            color: '#C9A24B',
            margin: '0',
        },
        bodyText: {
            fontSize: '13pt',
            lineHeight: 1.6,
            color: '#333',
            margin: '10px 0 10px 0',
        },
        courseName: {
            fontWeight: 'bold',
        },
        bottomSection: {
            position: 'absolute',
            bottom: '40px',
            left: '60px',
            right: '60px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
        },
        signatureBlock: {
            width: '220px',
            textAlign: 'center',
            fontSize: '12pt',
            position: 'relative',
        },
        mainSeal: {
             width: '110px',
             height: '110px',
             alignSelf: 'center',
             marginBottom: '20px'
        },
        signatureImage: {
            height: '40px',
            width: 'auto',
            marginBottom: '5px',
        },
        signatureLine: {
            borderTop: '1px solid #555',
            margin: '0 auto',
            width: '80%',
        },
        signatureTitle: {
            marginTop: '8px',
            fontWeight: 'bold',
            color: '#001F54',
        },
        footerContainer: {
            position: 'absolute',
            bottom: '30px',
            left: '40px',
            right: '40px',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '9pt',
            color: '#555',
        },
        registrationNumber: {
            position: 'absolute',
            top: '20px',
            right: '40px',
            fontSize: '10pt',
            color: '#555',
            zIndex: 2,
        }
    };
    
    return (
        <div style={styles.page}>
            <div style={styles.borderOuter}>
                <div style={styles.borderInner}>
                    <span style={styles.registrationNumber}>Registration No: {data.registrationNumber}</span>
                    <img src={data.watermarkUrl} style={styles.watermark} alt="Watermark" />
                    <div style={styles.content}>
                        <img src={data.logoUrl} style={styles.logo} alt="MTech IT Institute Logo" />
                        <h1 style={styles.instituteName}>MTech IT Institute</h1>
                        <h2 style={styles.mainTitle}>Certificate of Completion</h2>
                        <p style={styles.presentedTo}>PROUDLY PRESENTED TO</p>

                        <p style={styles.certifyText}>This is to certify that</p>
                        <p style={styles.studentName}>{data.studentName}</p>
                        
                        <p style={styles.bodyText}>
                            has successfully completed the
                            <br />
                            <span style={styles.courseName}>{data.testName}</span>
                            <br/>
                            with a score of <strong>{data.score}/{data.totalMarks} ({data.percentage.toFixed(2)}%)</strong> on {formatDate(data.examDate)}.
                        </p>
                    </div>

                    <div style={styles.bottomSection}>
                        <div style={styles.signatureBlock}>
                            <img src={data.signatureUrl} style={styles.signatureImage} alt="Director's Signature" />
                            <div style={styles.signatureLine}></div>
                            <p style={styles.signatureTitle}>Director</p>
                        </div>
                        
                        <img src={data.goldSealUrl} style={styles.mainSeal} alt="Golden Seal" />

                        <div style={styles.signatureBlock}>
                             <img src={data.signatureUrl} style={styles.signatureImage} alt="Controller's Signature" />
                            <div style={styles.signatureLine}></div>
                            <p style={styles.signatureTitle}>Exam Controller</p>
                        </div>
                    </div>

                     <div style={styles.footerContainer}>
                        <span>Certificate ID: {data.certificateId}</span>
                        <span>Issued on: {formatDate(data.issueDate)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
