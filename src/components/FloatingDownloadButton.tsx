
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
        <path d="M33.5 28.5V33.5C33.5 35.1569 32.1569 36.5 30.5 36.5H21.5C19.8431 36.5 18.5 35.1569 18.5 33.5V20.5C18.5 18.8431 19.8431 17.5 21.5 17.5H25.5" stroke="#1C1C1C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M22.5 14.5H35.5C37.1569 14.5 38.5 15.8431 38.5 17.5V30.5C38.5 32.1569 37.1569 33.5 35.5 33.5H33.5" stroke="#E1F5FE" strokeOpacity="0.8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="28.5" cy="24.5" r="7" fill="#2962FF"/>
        <path d="M28.5 22V27M26 24.5H31" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
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
          "fixed bottom-6 left-6 z-50 flex items-center h-14",
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

