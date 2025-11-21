
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

export async function generateCertificatePdf(data: CertificateData): Promise<string> {
  // Create a container element to render the component into
  const container = document.createElement('div');
  // Position it off-screen
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.width = '297mm'; // A4 width
  container.style.height = '210mm'; // A4 height
  document.body.appendChild(container);

  // Render the React component to an HTML string
  const staticMarkup = renderToStaticMarkup(CertificateTemplate({ ...data }));
  container.innerHTML = staticMarkup;
  
  // Use html2canvas to capture the rendered component
  const canvas = await html2canvas(container, {
    scale: 3, // Increase scale for better resolution
    useCORS: true,
    backgroundColor: null
  });

  // Clean up the off-screen container
  document.body.removeChild(container);

  const imgData = canvas.toDataURL('image/png');
  
  // Create a new jsPDF instance
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });
  
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  // Add the captured image to the PDF
  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  
  // Return the PDF as a data URL string
  return pdf.output('datauristring');
}
