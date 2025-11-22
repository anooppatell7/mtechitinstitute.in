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

// Correct A4 landscape pixel size for html2canvas at 96 DPI
const A4_WIDTH = 1123;
const A4_HEIGHT = 794;

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

    // Render off-screen container
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.top = "0";
    container.style.left = "0";
    container.style.width = `${A4_WIDTH}px`;
    container.style.height = `${A4_HEIGHT}px`;
    container.style.background = "white";
    container.style.zIndex = "-99999";

    container.innerHTML = renderToStaticMarkup(CertificateTemplate(finalData));
    document.body.appendChild(container);

    // Render to canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      imageTimeout: 0,
    });

    const imgData = canvas.toDataURL("image/png", 1.0);

    document.body.removeChild(container);

    // Create PDF
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [A4_WIDTH, A4_HEIGHT],
    });

    pdf.addImage(imgData, "PNG", 0, 0, A4_WIDTH, A4_HEIGHT);

    const blob = pdf.output("blob");

    // PROTECT Firebase from uploading empty blobs
    if (!blob || blob.size < 5000) {
      console.error("Generated PDF is INVALID:", blob.size);
      throw new Error("EMPTY_PDF_GENERATED");
    }

    return blob;
  } catch (err) {
    console.error("PDF ERROR:", err);
    throw new Error("PDF_GENERATION_FAILED");
  }
}
