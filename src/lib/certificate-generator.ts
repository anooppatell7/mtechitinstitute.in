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

async function getCertificateImages() {
  const logo = await preloadImageAsBase64(
    "https://res.cloudinary.com/dzr4xjizf/image/upload/v1757138798/mtechlogo_1_wsdhhx.png"
  );
  const sign = await preloadImageAsBase64(
    "https://res.cloudinary.com/dqycipmr0/image/upload/v1763721267/signature_kfj27k.png"
  );
  return { logo, sign };
}

export async function generateCertificate(data: CertificateData): Promise<Blob> {
  try {
    const { logo, sign } = await getCertificateImages();

    const finalData = {
      ...data,
      logoUrl: logo,
      directorSignUrl: sign,
      controllerSignUrl: sign,
    };

    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.top = "0";
    // Define exact dimensions for A4 landscape in pixels at 96 DPI for consistency
    container.style.width = "1123px";
    container.style.height = "794px";
    container.innerHTML = renderToStaticMarkup(CertificateTemplate(finalData));
    document.body.appendChild(container);

    const canvas = await html2canvas(container, {
      scale: 1,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      imageTimeout: 0,
    });
    
    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    
    const pdf = new jsPDF("landscape", "px", "a4");
    pdf.addImage(
      imgData,
      "JPEG",
      0,
      0,
      pdf.internal.pageSize.getWidth(),
      pdf.internal.pageSize.getHeight()
    );

    document.body.removeChild(container);

    return pdf.output("blob");
  } catch (err) {
    console.error("PDF ERROR:", err);
    throw new Error("PDF_GENERATION_FAILED");
  }
}
