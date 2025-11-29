
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Sparkles, Code, Cpu, Database, Server } from 'lucide-react';
import Link from 'next/link';
import type { PopupSettings } from '@/lib/types';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import Logo from './logo';

const POPUP_DISMISSED_KEY = 'salesPopupDismissed_v2';

const TechIcon = ({ icon, className }: { icon: React.ReactNode, className?: string }) => (
    <div className={cn("absolute rounded-full bg-white/10 backdrop-blur-sm p-2 text-purple-300 animate-float", className)}>
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
  
  const techBg = "https://res.cloudinary.com/dzr4xjizf/image/upload/v1764264871/abstract-blue-circuit-board-background-technology-concept_53876-107755_l2rtyc.jpg";

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="sm:max-w-3xl w-[95%] p-0 overflow-hidden bg-gray-900/50 text-white border-accent/30 shadow-2xl backdrop-blur-lg rounded-2xl"
        style={{
             backgroundImage: `url(${techBg})`,
             backgroundSize: 'cover',
             backgroundPosition: 'center',
        }}
        >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-purple-950/70 to-indigo-900/80"></div>
        
        {/* Floating Icons */}
        <div className="relative w-full h-full">
            <TechIcon icon={<Code className="h-6 w-6"/>} className="top-[15%] left-[10%] hidden md:flex" style={{animationDelay: '0.5s'}} />
            <TechIcon icon={<Cpu className="h-8 w-8"/>} className="bottom-[20%] left-[25%] hidden md:flex" style={{animationDelay: '2s'}} />
            <TechIcon icon={<Database className="h-6 w-6"/>} className="top-[25%] right-[15%] hidden md:flex" style={{animationDelay: '1.5s'}} />
            <TechIcon icon={<Server className="h-7 w-7"/>} className="bottom-[10%] right-[20%] hidden md:flex" style={{animationDelay: '3s'}} />
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 items-center">
            {/* Image section */}
            <div className={cn(
                "relative hidden md:flex items-center justify-center p-8",
                settings.imageUrl ? "h-full" : "bg-black/20 rounded-l-2xl"
            )}>
                 {settings.imageUrl ? (
                    <Image 
                        src={settings.imageUrl} 
                        alt={settings.title} 
                        fill
                        className="object-cover md:rounded-l-2xl"
                    />
                 ) : (
                    <div className="flex flex-col items-center justify-center gap-4 opacity-80">
                      <Image
                        src="https://res.cloudinary.com/dzr4xjizf/image/upload/v1763980341/trasparent_logo_ok6afb.png"
                        alt="MTech IT Institute Logo"
                        width={150}
                        height={150}
                        className="h-40 w-40 object-contain"
                      />
                    </div>
                 )}
            </div>
            
             {/* Text content section */}
            <div className="p-8 text-center md:text-left">
                <DialogHeader>
                    <div className="flex justify-center md:justify-start mb-4">
                        <Sparkles className="h-10 w-10 text-purple-300" />
                    </div>
                    <DialogTitle className="text-4xl font-headline text-white drop-shadow-lg">{settings.title}</DialogTitle>
                    <DialogDescription className="text-purple-200 mt-2 text-base">
                        {settings.description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-8 sm:justify-center md:justify-start">
                    <Button asChild size="lg" className="bg-purple-500 text-white hover:bg-purple-400 transition-transform hover:scale-105 ring-2 ring-offset-2 ring-offset-[#0a0a2a] ring-purple-400/80">
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
            className="absolute top-4 right-4 rounded-full text-white/70 hover:text-white hover:bg-white/10 z-20"
            onClick={handleClose}
          >
            <X className="h-6 w-6" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
