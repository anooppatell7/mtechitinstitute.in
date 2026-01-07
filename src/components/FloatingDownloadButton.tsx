
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Download } from 'lucide-react';
import { cn } from '@/lib/utils';


const HandPhoneIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="48" height="48" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <circle cx="26" cy="26" r="24" fill="url(#blue-gradient-circle)"/>
        <defs>
            <linearGradient id="blue-gradient-circle" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4FC3F7"/>
            <stop offset="100%" stopColor="#29B6F6"/>
            </linearGradient>
        </defs>
        <path d="M26 20V32M21 27L26 32L31 27" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);


export default function FloatingDownloadButton() {
  const pathname = usePathname();
  const downloadPageUrl = '/mtech-it-institute.apk';
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if running in a standalone-like mode (PWA, some WebViews)
    const isAppMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    
    // Check for custom User-Agent string from the Android WebView
    const isCustomWebView = navigator.userAgent.includes("MTechApp-WebView");

    // Define the paths where the icon should be hidden (e.g., during exams)
    const hiddenPaths = ['/mock-tests/', '/exam/'];
    const isPathHidden = hiddenPaths.some(path => pathname.startsWith(path));

    // Show the button only if it's NOT in app mode, NOT in the custom webview, and NOT on a hidden path
    if (!isAppMode && !isCustomWebView && !isPathHidden) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [pathname]);

  if (!isVisible) {
    return null;
  }

  return (
    <Link
      href={downloadPageUrl}
      className={cn(
          "fixed bottom-6 left-6 z-50 flex items-center h-14 download-btn-floating",
          "bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full shadow-lg",
          "transition-transform duration-300 hover:scale-105",
          "animate-in fade-in slide-in-from-bottom-10"
      )}
      aria-label="Download the MTech IT Institute App"
    >
      <div className="flex items-center pl-1 pr-5">
        <HandPhoneIcon className="w-12 h-12 drop-shadow-md" />
        <div className="ml-2 text-white text-left">
            <p className="font-bold text-base leading-tight uppercase">Download App</p>
            <p className="text-xs leading-tight">For better experience</p>
        </div>
      </div>
    </Link>
  );
}
