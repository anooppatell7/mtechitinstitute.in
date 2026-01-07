
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Download } from 'lucide-react';

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
      className="fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform duration-300 hover:scale-110 hover:bg-primary/90"
      aria-label="Download Android App"
    >
      <Download className="h-7 w-7" />
    </Link>
  );
}
