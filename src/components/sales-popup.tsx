
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Sparkles, Code, Cpu, Database, Server, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import type { PopupSettings } from '@/lib/types';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const POPUP_DISMISSED_KEY = 'salesPopupDismissed_v2';

const TechIcon = ({ icon, className, style }: { icon: React.ReactNode, className?: string, style?: React.CSSProperties }) => (
    <div className={cn("absolute rounded-full bg-white/10 backdrop-blur-sm p-2 text-purple-300 animate-float", className)} style={style}>
        {icon}
    </div>
);

export default function SalesPopup({ settings }: { settings: PopupSettings }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const isDismissed = sessionStorage.getItem(POPUP_DISMISSED_KEY);
    if (!isDismissed) {
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent 
        className="sm:max-w-xl w-[95%] p-0 overflow-hidden bg-gray-900/50 text-white border-accent/30 shadow-2xl backdrop-blur-lg rounded-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 via-purple-950/70 to-blue-900/80 z-0"></div>
        
        {/* Decorative Floating Icons */}
        <div className="relative w-full h-full hidden md:block">
            <TechIcon icon={<Code className="h-5 w-5"/>} className="top-[15%] left-[10%]" style={{animationDelay: '0.5s'}} />
            <TechIcon icon={<Cpu className="h-7 w-7"/>} className="bottom-[20%] left-[25%]" style={{animationDelay: '2s'}} />
            <TechIcon icon={<Database className="h-5 w-5"/>} className="top-[25%] right-[15%]" style={{animationDelay: '1.5s'}} />
        </div>

        <DialogHeader className="relative z-10 p-8 sm:p-10 text-center">
            <div className="flex justify-center mb-4">
                <Sparkles className="h-10 w-10 text-purple-300 animate-pulse" />
            </div>
            <DialogTitle className="text-4xl font-headline text-white drop-shadow-lg">{settings.title}</DialogTitle>
            <DialogDescription className="text-purple-200 mt-2 text-lg">
                {settings.description}
            </DialogDescription>
        </DialogHeader>

        <DialogFooter className="relative z-10 px-8 sm:px-10 pb-8 sm:pb-10 sm:justify-center">
            <Button asChild size="lg" className="bg-purple-500 text-white hover:bg-purple-400 transition-transform hover:scale-105 ring-2 ring-offset-2 ring-offset-[#0a0a2a] ring-purple-400/80">
                <Link href={settings.ctaLink || '#'}>
                    {settings.ctaText || 'Learn More'}
                </Link>
            </Button>
        </DialogFooter>

        <DialogClose 
            className="absolute top-4 right-4 rounded-full w-8 h-8 bg-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-colors z-20"
            onClick={handleClose}
        >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
