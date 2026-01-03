
'use client';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { renderToStaticMarkup } from 'react-dom/server';
import CertificateTemplate from '@/components/certificate-template';
import type { ExamResult } from './types';
import { preloadImageAsBase64 } from './base64-preloader';

interface CertificateData extends Omit<ExamResult, 'id' | 'submittedAt' | 'responses' | 'timeTaken'> {
  certificateId: string;
  issueDate: string;
  examDate: string;
  percentage: number;
}

// A4 landscape pixel size for html2canvas at 96 DPI
const A4_WIDTH = 1123;
const A4_HEIGHT = 794;

async function getCertificateImages() {
  const [logo, watermark, goldSeal, signature] = await Promise.all([
    preloadImageAsBase64("https://res.cloudinary.com/dzr4xjizf/image/upload/v1757138798/mtechlogo_1_wsdhhx.png"),
    preloadImageAsBase64("https://res.cloudinary.com/dzr4xjizf/image/upload/v1763804040/watermark_png.png"),
    preloadImageAsBase64("https://res.cloudinary.com/dzr4xjizf/image/upload/v1763803007/seal_png.png"),
    preloadImageAsBase64("https://res.cloudinary.com/dqycipmr0/image/upload/v1763721267/signature_kfj27k.png"),
  ]);

  return { logo, watermark, goldSeal, signature };
}

/**
 * Generates a certificate as a Blob URL for client-side download.
 * @param data The data for the certificate.
 * @returns A promise that resolves to an object containing the Blob URL and a filename.
 */
export async function generateCertificatePdf(data: CertificateData): Promise<{ blobUrl: string, fileName: string }> {
  try {
    const { logo, watermark, goldSeal, signature } = await getCertificateImages();
    
    const finalData = {
      ...data,
      logoUrl: logo,
      watermarkUrl: watermark,
      goldSealUrl: goldSeal,
      signatureUrl: signature,
    };
    
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.top = "-9999px";
    container.style.left = "-9999px";
    container.style.width = `${A4_WIDTH}px`;
    container.style.height = `${A4_HEIGHT}px`;
    container.style.zIndex = "-1"; 
    container.style.fontFamily = '"Great Vibes", "Playfair Display", serif';
    document.body.appendChild(container);
    
    const staticMarkup = renderToStaticMarkup(CertificateTemplate(finalData));
    container.innerHTML = staticMarkup;
    
    await new Promise(resolve => setTimeout(resolve, 500));

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      imageTimeout: 0,
    });

    const imgData = canvas.toDataURL("image/png", 1.0);
    document.body.removeChild(container);

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [A4_WIDTH, A4_HEIGHT],
    });

    pdf.addImage(imgData, "PNG", 0, 0, A4_WIDTH, A4_HEIGHT);
    
    // Generate Blob and create a URL for it
    const pdfBlob = pdf.output('blob');
    const blobUrl = window.URL.createObjectURL(pdfBlob);
    const fileName = `Certificate-${data.studentName.replace(/ /g, '_')}.pdf`;

    return { blobUrl, fileName };

  } catch (err) {
    console.error("PDF_GENERATION_FAILED:", err);
    throw err;
  }
}
