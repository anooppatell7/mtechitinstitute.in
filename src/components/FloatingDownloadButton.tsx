"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Download } from 'lucide-react';

const AndroidIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M4 14V17C4 18.1046 4.89543 19 6 19H18C19.1046 19 20 18.1046 20 17V14M12 4V14M12 14L9 11M12 14L15 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);


export default function FloatingDownloadButton() {
  const pathname = usePathname();
  const downloadPageUrl = '/mtech-it-institute.apk';

  // Define the paths where the icon should be hidden
  const hiddenPaths = ['/mock-tests/', '/exam/'];

  // Check if the current path starts with any of the hidden paths
  const isHidden = hiddenPaths.some(path => pathname.startsWith(path));

  if (isHidden) {
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
