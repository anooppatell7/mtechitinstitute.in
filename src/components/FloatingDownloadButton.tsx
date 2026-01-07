"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Download } from 'lucide-react';
import { cn } from '@/lib/utils';


const HandPhoneIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="60" height="60" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M35.6,80C34.4,80,33.3,79.5,32.4,78.6L2.8,49C1,47.2,1,44.2,2.8,42.4L11.2,34c1.8-1.8,4.8-1.8,6.6,0l5.4,5.4
        c0.9,0.9,2.3,0.9,3.2,0l8.4-8.4c0.9-0.9,0.9-2.3,0-3.2l-8-8c-0.9-0.9-0.9-2.3,0-3.2l4.8-4.8c0.9-0.9,2.3-0.9,3.2,0l20.4,20.4
        c0.9,0.9,0.9,2.3,0,3.2l-4.8,4.8c-0.9,0.9-2.3,0.9-3.2,0l-8.4-8.4c-0.9-0.9-2.3-0.9-3.2,0l-5.8,5.8c-0.9,0.9-0.9,2.3,0,3.2
        l8.8,8.8c0.9,0.9,2.3,0.9,3.2,0l8.4-8.4c0.9-0.9,2.3-0.9,3.2,0l5.4,5.4c1.8,1.8,1.8,4.8,0,6.6L44.2,78.6
        c-0.9,0.9-2,1.4-3.2,1.4H35.6z" fill="#F4DDC0"/>
        <rect x="25" y="2" width="40" height="64" rx="8" fill="#58CCF8"/>
        <rect x="27" y="4" width="36" height="54" rx="6" fill="#1C1C1C"/>
        <path d="M45 10H49" stroke="#58CCF8" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="45" cy="33" r="8" fill="#3D92F8"/>
        <path d="M45 28V38M40 33H50" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        <path d="M41,33.5l4,4l4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
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
          "fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center h-16",
          "bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full shadow-lg",
          "transition-transform duration-300 hover:scale-105",
          "animate-in fade-in slide-in-from-bottom-10"
      )}
      aria-label="Download the MTech IT Institute App"
    >
      <div className="flex items-center pl-1 pr-6">
        <HandPhoneIcon className="w-16 h-16 drop-shadow-md -translate-y-1" />
        <div className="ml-2 text-white text-left">
            <p className="font-bold text-lg leading-tight uppercase">Download the App!</p>
            <p className="text-xs leading-tight">For better experience download our app!</p>
        </div>
      </div>
    </Link>
  );
}
