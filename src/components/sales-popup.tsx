
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { X, Sparkles } from 'lucide-react';
import Link from 'next/link';
import type { PopupSettings } from '@/lib/types';

const POPUP_DISMISSED_KEY = 'salesPopupDismissed_v1';

export default function SalesPopup({ settings }: { settings: PopupSettings }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show popup only if it hasn't been dismissed for the current session
    const isDismissed = sessionStorage.getItem(POPUP_DISMISSED_KEY);
    if (!isDismissed) {
      // Delay popup to not be too intrusive
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    sessionStorage.setItem(POPUP_DISMISSED_KEY, 'true');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white border-accent">
        <div className="relative">
          <Image
            src={settings.imageUrl || 'https://picsum.photos/seed/sale/600/400'}
            alt={settings.title}
            width={600}
            height={400}
            className="w-full h-auto object-cover opacity-30"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
            <Sparkles className="h-12 w-12 text-yellow-300 mb-4 animate-pulse" />
            <DialogHeader>
              <DialogTitle className="text-3xl font-headline text-white drop-shadow-md">{settings.title}</DialogTitle>
              <DialogDescription className="text-blue-100 mt-2 text-lg">
                {settings.description}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-8 sm:justify-center">
              <Button asChild size="lg" className="bg-yellow-400 text-gray-900 hover:bg-yellow-300 transition-transform hover:scale-105">
                <Link href={settings.ctaLink || '#'}>
                  {settings.ctaText || 'Learn More'}
                </Link>
              </Button>
            </DialogFooter>
          </div>
        </div>
         <DialogClose asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 rounded-full text-white/70 hover:text-white hover:bg-white/20"
            onClick={handleClose}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
