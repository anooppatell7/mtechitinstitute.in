'use client';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { renderToStaticMarkup } from 'react-dom/server';
import CertificateTemplate from '@/components/certificate-template';
import type { ExamResult } from './types';

interface CertificateData extends Omit<ExamResult, 'id' | 'submittedAt' | 'responses' | 'timeTaken'> {
  certificateId: string;
  issueDate: string;
  examDate: string;
  percentage: number;
}

// Convert image URL → Base64
async function toBase64(url: string): Promise<string> {
  const res = await fetch(url, { mode: 'cors' });
  const blob = await res.blob();
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result));
    reader.readAsDataURL(blob);
  });
}

export async function generateCertificatePdf(data: CertificateData): Promise<Blob> {
  try {
    // PRELOAD IMAGES SAFELY
    const logoBase64 = await toBase64("https://res.cloudinary.com/dzr4xjizf/image/upload/v1757138798/mtechlogo_1_wsdhhx.png");
    const signBase64 = await toBase64("https://res.cloudinary.com/dqycipmr0/image/upload/v1763721267/signature_kfj27k.png");

    const finalData = {
      ...data,
      logoUrl: logoBase64,
      directorSignUrl: signBase64,
      controllerSignUrl: signBase64,
    };

    // Create off-screen container
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '0';
    container.style.top = '0';
    container.style.width = '1120px';
    container.style.height = '790px';
    container.style.opacity = '0';
    container.style.pointerEvents = 'none';
    document.body.appendChild(container);

    container.innerHTML = renderToStaticMarkup(
      CertificateTemplate({ ...finalData })
    );

    // RENDER (SAFE SETTINGS)
    const canvas = await html2canvas(container, {
      scale: 1.4,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    document.body.removeChild(container);

    const img = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: 'a4' });
    pdf.addImage(img, 'JPEG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
    return pdf.output('blob');

  } catch (err) {
    console.error("PDF Generation Error:", err);
    throw err;
  }
}
