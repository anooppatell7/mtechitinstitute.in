
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
  const [logo, watermark, goldSeal, signature, leftSeal, rightSeal] = await Promise.all([
    preloadImageAsBase64("https://res.cloudinary.com/dzr4xjizf/image/upload/v1757138798/mtechlogo_1_wsdhhx.png"),
    preloadImageAsBase64("https://res.cloudinary.com/dzr4xjizf/image/upload/v1763804040/watermark_png.png"),
    preloadImageAsBase64("https://res.cloudinary.com/dzr4xjizf/image/upload/v1763803007/seal_png.png"),
    preloadImageAsBase64("https://res.cloudinary.com/dqycipmr0/image/upload/v1763721267/signature_kfj27k.png"),
    preloadImageAsBase64("https://res.cloudinary.com/dzr4xjizf/image/upload/v1763803007/seal_png.png"), // Using same seal for left
    preloadImageAsBase64("https://res.cloudinary.com/dzr4xjizf/image/upload/v1763803007/seal_png.png")  // and right
  ]);

  return { logo, watermark, goldSeal, signature, leftSeal, rightSeal };
}

export async function generateCertificatePdf(data: CertificateData): Promise<Blob> {
  try {
    const { logo, watermark, goldSeal, signature, leftSeal, rightSeal } = await getCertificateImages();
    
    const finalData = {
      ...data,
      logoUrl: logo,
      watermarkUrl: watermark,
      goldSealUrl: goldSeal,
      signatureUrl: signature,
      leftSealUrl: leftSeal,
      rightSealUrl: rightSeal,
    };
    
    // Create an off-screen container for rendering
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.top = "0";
    container.style.left = "0";
    container.style.width = `${A4_WIDTH}px`;
    container.style.height = `${A4_HEIGHT}px`;
    container.style.zIndex = "-9999"; // Hide it
    container.style.fontFamily = '"Great Vibes", "Playfair Display", serif';
    document.body.appendChild(container);
    
    // Render the React component to an HTML string
    const staticMarkup = renderToStaticMarkup(CertificateTemplate(finalData));
    container.innerHTML = staticMarkup;
    
    // Add a small delay to ensure fonts and images are loaded by the browser
    await new Promise(resolve => setTimeout(resolve, 500));

    // Render to canvas
    const canvas = await html2canvas(container, {
      scale: 2, // For higher resolution
      useCORS: true,
      allowTaint: true,
      backgroundColor: null, // Transparent background
      imageTimeout: 0,
    });

    const imgData = canvas.toDataURL("image/png", 1.0);

    // Clean up the off-screen container
    document.body.removeChild(container);

    // Create PDF
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [A4_WIDTH, A4_HEIGHT],
    });

    pdf.addImage(imgData, "PNG", 0, 0, A4_WIDTH, A4_HEIGHT);
    const blob = pdf.output("blob");

    if (!blob || blob.size < 5000) {
      console.error("Generated PDF is too small or invalid:", blob.size);
      throw new Error("EMPTY_PDF_GENERATED");
    }

    return blob;
  } catch (err) {
    console.error("PDF_GENERATION_FAILED:", err);
    throw err; // Re-throw the original error
  }
}
