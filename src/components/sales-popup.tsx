
"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Rocket, Sparkles, Database } from 'lucide-react';
import Link from 'next/link';
import type { PopupSettings } from '@/lib/types';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const POPUP_DISMISSED_KEY = 'salesPopupDismissed_v4';

const CircuitLine = ({ className }: { className?: string }) => (
    <svg className={cn("absolute w-full h-auto text-blue-400/20 pointer-events-none", className)} viewBox="0 0 400 100" preserveAspectRatio="none">
        <path d="M0 50 Q 20 80, 40 50 T 80 50 T 120 50 Q 140 20, 160 50 T 200 50 Q 220 90, 240 50 T 280 50 T 320 50 Q 340 10, 360 50 T 400 50" stroke="currentColor" strokeWidth="0.5" fill="none" />
        <path d="M0 60 Q 25 30, 50 60 T 100 60 Q 125 100, 150 60 T 200 60 Q 225 20, 250 60 T 300 60 Q 325 80, 350 60 T 400 60" stroke="currentColor" strokeWidth="0.25" fill="none" />
    </svg>
);


export default function SalesPopup({ settings }: { settings: PopupSettings }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const isDismissed = sessionStorage.getItem(POPUP_DISMISSED_KEY);
    if (!isDismissed && settings.isVisible) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [settings.isVisible]);

  const handleClose = () => {
    sessionStorage.setItem(POPUP_DISMISSED_KEY, 'true');
    setIsOpen(false);
  };
  
  if (!settings.isVisible) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) handleClose();
        else setIsOpen(true);
    }}>
      <DialogContent 
        className="sm:max-w-md w-[95%] p-0 overflow-hidden text-white border-2 border-blue-500/20 shadow-2xl rounded-2xl bg-[#0d1a3a]"
        onInteractOutside={handleClose}
      >
        <div className="relative isolate overflow-hidden p-8 pt-10 text-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-[#0d1a3a] to-[#0d1a3a]">
            
            {/* Background Decorations */}
            <CircuitLine className="top-0 left-0 opacity-50" />
            <CircuitLine className="bottom-0 left-0 transform scale-y-[-1] opacity-50" />
            
            {/* Floating Icons */}
            <Sparkles className="absolute top-8 left-8 h-8 w-8 text-blue-400/50 animate-pulse" />
            <code className="absolute top-12 right-8 text-2xl font-mono text-purple-400/40 opacity-50">&lt;/&gt;</code>
            <Database className="absolute bottom-8 left-12 h-8 w-8 text-green-400/30 animate-pulse" />
            
            {/* Content */}
            <div className="flex flex-col items-center">
                <div className="relative mb-4">
                    <div className="absolute -inset-4 bg-blue-500/30 rounded-full blur-2xl animate-pulse"></div>
                    <Image src={settings.imageUrl || "https://res.cloudinary.com/dzr4xjizf/image/upload/v1757138798/mtechlogo_1_wsdhhx.png"} alt="MTech IT Institute" width={80} height={80} className="drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                </div>
                
                <h2 className="font-headline text-3xl font-bold uppercase tracking-wider drop-shadow-sm">
                  {settings.title || 'BLACK FRIDAY SALE!'}
                </h2>
                
                <p className="mt-4 text-base text-blue-200/80">
                  {settings.description || 'GET 20% off on any Course'}
                </p>

                <div className="mt-8">
                    <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:opacity-90 transition-opacity transform hover:scale-105 rounded-full px-8 py-6 text-base font-semibold shadow-lg shadow-blue-500/30">
                        <Link href={settings.ctaLink || '/courses'}>
                            {settings.ctaText || 'View Courses'}
                            <Rocket className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
