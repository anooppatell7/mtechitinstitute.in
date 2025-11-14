
"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "../ui/button";
import { Award, BrainCircuit, Target } from "lucide-react";
import { cn } from "@/lib/utils";

// Brand-inspired SVG Icon components
const IconPhotoshop = ({ className }: { className?: string }) => (
    <svg className={cn("h-10 w-10", className)} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#31a8ff"/>
        <path d="M8.5 8H12C13.6569 8 15 9.34315 15 11C15 12.6569 13.6569 14 12 14H8.5V16" stroke="#001d33" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8.5 11H12" stroke="#001d33" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const IconTally = ({ className }: { className?: string }) => (
     <svg className={cn("h-10 w-10", className)} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#0d47a1"/>
        <rect x="4" y="4" width="8" height="8" fill="#1e88e5"/>
        <rect x="12" y="4" width="8" height="16" fill="#42a5f5"/>
        <rect x="4" y="12" width="8" height="8" fill="#ffc107"/>
        <path d="M6 16L8 14" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
);

const IconExcel = ({ className }: { className?: string }) => (
    <svg className={cn("h-10 w-10", className)} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 5C2 3.89543 2.89543 3 4 3H14L22 8V19C22 20.1046 21.1046 21 20 21H4C2.89543 21 2 20.1046 2 19V5Z" fill="#107c41"/>
        <path d="M14 3L22 8H16C14.8954 8 14 7.10457 14 6V3Z" fill="#16a34a"/>
        <text x="8" y="16" fontFamily="Arial, sans-serif" fontSize="10" fill="white" fontWeight="bold">X</text>
    </svg>
);

const IconWord = ({ className }: { className?: string }) => (
    <svg className={cn("h-10 w-10", className)} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 5C2 3.89543 2.89543 3 4 3H14L22 8V19C22 20.1046 21.1046 21 20 21H4C2.89543 21 2 20.1046 2 19V5Z" fill="#2b579a"/>
        <path d="M14 3L22 8H16C14.8954 8 14 7.10457 14 6V3Z" fill="#2d72d9"/>
        <text x="7" y="16" fontFamily="Arial, sans-serif" fontSize="10" fill="white" fontWeight="bold">W</text>
    </svg>
);

const IconPowerPoint = ({ className }: { className?: string }) => (
    <svg className={cn("h-10 w-10", className)} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#d24726"/>
        <circle cx="12" cy="12" r="6" fill="white"/>
        <text x="9" y="16" fontFamily="Arial, sans-serif" fontSize="10" fill="#d24726" fontWeight="bold">P</text>
    </svg>
);

const IconCorel = ({ className }: { className?: string }) => (
    <svg className={cn("h-10 w-10", className)} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M50,2.5A47.5,47.5 0 0,0 2.5,50V90L50,75,97.5,90V50A47.5,47.5 0 0,0 50,2.5Z" fill="#00a94f"/>
        <path d="M50,2.5A47.5,47.5 0 0,1 97.5,50V90L50,75Z" fill="#8bc53f"/>
        <path d="M50,45 A15,15 0 0,1 50,75" fill="#f04e46"/>
        <path d="M50,45 A15,15 0 0,0 50,75" fill="#f9ad3d"/>
        <path d="M50,2.5A47.5,47.5 0 0,0 2.5,50V90L50,75V2.5Z" opacity="0.1"/>
    </svg>
);

const AnimatedIcon = ({ children, className, style }: { children: React.ReactNode, className?: string, style?: React.CSSProperties }) => (
  <div className={cn("absolute bg-card/60 backdrop-blur-sm p-3 rounded-full shadow-lg border border-border/20 animate-float", className)} style={style}>
      {children}
  </div>
);


export default function About() {
  return (
    <section className="py-16 sm:py-24 bg-secondary/50 relative overflow-hidden">
      
      {/* Floating Icons - Decorative */}
      <AnimatedIcon className="top-1/4 left-[5%] hidden lg:block"><IconPhotoshop /></AnimatedIcon>
      <AnimatedIcon className="top-1/3 right-[8%] hidden lg:block" style={{ animationDelay: '1s' }}><IconTally /></AnimatedIcon>
      <AnimatedIcon className="bottom-1/4 left-[10%]" style={{ animationDelay: '2s' }}><IconExcel /></AnimatedIcon>
      <AnimatedIcon className="bottom-[15%] right-[5%]" style={{ animationDelay: '0.5s' }}><IconWord /></AnimatedIcon>
      <AnimatedIcon className="top-[15%] right-[20%]" style={{ animationDelay: '1.5s' }}><IconCorel className="h-8 w-8" /></AnimatedIcon>
       <AnimatedIcon className="top-[60%] left-[15%]" style={{ animationDelay: '2.5s' }}><IconPowerPoint className="h-8 w-8" /></AnimatedIcon>

      <div className="container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-headline text-3xl font-bold text-primary sm:text-4xl">
              From Foundational Skills to Career Success
            </h2>
            <p className="mt-4 text-lg text-foreground/80">
              At MTech IT Institute, our mission is simple: to bridge the gap between academic knowledge and real-world industry demands. We are dedicated to providing practical, job-oriented computer training that empowers you to achieve your career goals.
            </p>
            
            <div className="mt-8 space-y-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-full text-accent">
                        <Target className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-primary">Practical, Hands-On Learning</h3>
                        <p className="text-foreground/80">Our curriculum is designed by industry experts to be relevant and focused on real-world applications, ensuring you're job-ready from day one.</p>
                    </div>
                </div>
                 <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-full text-accent">
                        <BrainCircuit className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-primary">Expert Instructors</h3>
                        <p className="text-foreground/80">Learn from experienced professionals who bring years of practical knowledge and a passion for teaching to the classroom.</p>
                    </div>
                </div>
                 <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-full text-accent">
                        <Award className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-primary">Career-Focused Courses</h3>
                        <p className="text-foreground/80">Whether you're starting out or upskilling, our <Link href="/courses" className="text-accent font-semibold hover:underline">comprehensive courses</Link> are your launchpad to success in the tech industry.</p>
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <Button asChild size="lg">
                    <Link href="/about">Learn More About Us</Link>
                </Button>
            </div>
          </div>
          <div className="w-full">
            <Card className="overflow-hidden shadow-2xl rounded-xl border-t-4 border-t-accent">
              <CardContent className="p-0">
                <Image
                  src="https://res.cloudinary.com/dzr4xjizf/image/upload/v1757136324/ChatGPT_Image_Sep_5_2025_10_25_03_PM_w0e2ry.png"
                  alt="Students learning in a modern computer lab at MTech IT Institute in Patti"
                  data-ai-hint="classroom students"
                  width={800}
                  height={600}
                  className="w-full h-auto object-cover"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
