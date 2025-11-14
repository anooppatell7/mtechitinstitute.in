
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

const IconPageMaker = ({ className }: { className?: string }) => (
    <svg className={cn("h-10 w-10", className)} fill="#d81b60" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"  viewBox="0 0 512 512" enableBackground="new 0 0 512 512" xmlSpace="preserve">
        <path d="M239.532,463.443h32.923c5.977,0,10.85,4.873,10.85,10.85v26.369c0,5.963-4.873,10.837-10.85,10.837 h-32.923c-5.963,0-10.837-4.874-10.837-10.837v-26.369C228.695,468.316,233.569,463.443,239.532,463.443L239.532,463.443z M239.532,463.443 M102.525,146.023c0.412,81.391,69.535,208.35,133.431,295.97h6.288 c-48.593-88.639-90.036-197.933-90.402-284.073c-0.341-78.151,31.58-127.745,74.662-156.048c-9.564,0.89-19.146,2.217-28.64,4.042 C144.734,27.04,102.144,70.638,102.525,146.023L102.525,146.023z M102.525,146.023 M243.163,0.753 c-24.897,33.505-44.102,81.012-43.931,149.948c0.229,89.978,21.279,196.93,48.426,291.292h16.684 c27.147-94.361,48.197-201.314,48.427-291.292c0.17-68.936-19.034-116.443-43.931-149.948 C260.288,0.417,251.713,0.417,243.163,0.753L243.163,0.753z M243.163,0.753 M409.475,146.023 c-0.411,81.391-69.534,208.35-133.431,295.97h-6.287c48.592-88.639,90.036-197.933,90.397-284.073 C360.5,79.77,328.579,30.175,285.497,1.872c9.564,0.89,19.146,2.217,28.627,4.042C367.266,27.04,409.854,70.638,409.475,146.023 L409.475,146.023z M409.475,146.023 M280.382,441.993c71.526-75.27,152.676-201.084,153.212-298.033 c0.325-59.454-28.614-98.881-69.151-122.959c49.665,21.308,87.449,60.635,87.083,124.556 c-0.582,98.475-94.968,228.569-169.9,296.436H280.382z M280.382,441.993 M231.619,441.993 C160.092,366.724,78.943,240.909,78.406,143.96c-0.324-59.454,28.603-98.881,69.14-122.959 C97.894,42.31,60.109,81.637,60.475,145.557c0.583,98.475,94.969,228.569,169.9,296.436H231.619z M231.619,441.993"></path>
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
      <AnimatedIcon className="top-[70%] right-[15%]" style={{ animationDelay: '3s' }}><IconPageMaker className="h-9 w-9" /></AnimatedIcon>


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
