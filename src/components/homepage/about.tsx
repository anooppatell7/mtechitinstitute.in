
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
     <svg className={cn("h-10 w-10", className)} viewBox="0 123.306 595.279 595.279" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <radialGradient id="tallyGrad" cx="-183.69" cy="328.972" r=".76" gradientTransform="matrix(545.6736 0 0 528.3113 100439.305 -173525.125)" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#34364e" stopOpacity=".98"/>
                <stop offset="1" stopColor="#0c0824"/>
            </radialGradient>
        </defs>
        <path d="M24.803 155.549h545.674v530.792H24.803V155.549z" fill="url(#tallyGrad)"/>
        <path d="m401.318 450.958-26.291-18.106c0-8.929 4.464-15.13 30.756-28.772 38.941-18.851 51.095-36.957 51.095-63.497 0-39.685-30.26-61.016-71.186-61.016-21.579 0-40.182-4.465-50.847-10.665-1.736-.744-1.984-1.984-1.984-3.969v-36.461c0-2.48 1.24-3.225 2.977-1.984 15.626 10.17 33.484 14.634 49.854 14.634 19.595 0 27.78-8.185 27.78-19.347 0-8.929-5.705-16.866-30.757-29.764-35.221-16.866-49.854-33.98-49.854-62.504 0-31.997 25.052-58.536 68.457-58.536 21.331 0 36.213 3.225 44.398 6.945 1.984 1.24 2.48 3.224 2.48 4.96v33.98c0 1.984-1.24 3.225-3.721 2.48-10.913-6.943-27.035-11.16-43.157-11.16zm-213.309 29.516c5.705.496 10.17.496 20.091.496 29.021 0 56.304-10.169 56.304-49.606 0-31.5-19.595-47.375-52.583-47.375-9.921 0-19.347.496-23.812.744v95.741zM143.86 266.668c0-1.736 3.473-2.977 5.456-2.977 15.875-.744 39.438-1.24 63.993-1.24 68.705 0 95.492 37.701 95.492 85.82 0 63-45.638 90.036-101.693 90.036-9.425 0-12.649-.496-19.347-.496v95.245c0 1.984-.744 2.976-2.976 2.976h-37.949c-1.984 0-2.977-.744-2.977-2.976V266.668z" fill="#31c5f0"/>
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
    <svg className={cn("h-10 w-10", className)} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="wordPaint0" x1="8" y1="6.66667" x2="32" y2="6.66667" gradientUnits="userSpaceOnUse">
                <stop stopColor="#2B78B1"/><stop offset="1" stopColor="#338ACD"/>
            </linearGradient>
            <linearGradient id="wordPaint1" x1="8" y1="27.375" x2="32" y2="27.375" gradientUnits="userSpaceOnUse">
                <stop stopColor="#1B366F"/><stop offset="1" stopColor="#2657B0"/>
            </linearGradient>
            <linearGradient id="wordPaint2" x1="18.5" y1="20" x2="32" y2="20" gradientUnits="userSpaceOnUse">
                <stop stopColor="#20478B"/><stop offset="1" stopColor="#2D6FD1"/>
            </linearGradient>
            <linearGradient id="wordPaint3" x1="18.5" y1="13" x2="32" y2="13" gradientUnits="userSpaceOnUse">
                <stop stopColor="#215295"/><stop offset="1" stopColor="#2E84D3"/>
            </linearGradient>
            <linearGradient id="wordPaint4" x1="0" y1="17" x2="19" y2="17" gradientUnits="userSpaceOnUse">
                <stop stopColor="#223E74"/><stop offset="1" stopColor="#215091"/>
            </linearGradient>
        </defs>
        <rect x="8" y="2" width="24" height="28" rx="2" fill="url(#wordPaint0)"/>
        <path d="M8 23H32V28C32 29.1046 31.1046 30 30 30H10C8.89543 30 8 29.1046 8 28V23Z" fill="url(#wordPaint1)"/>
        <rect x="8" y="16" width="24" height="7" fill="url(#wordPaint2)"/>
        <rect x="8" y="9" width="24" height="7" fill="url(#wordPaint3)"/>
        <path d="M8 12C8 10.3431 9.34315 9 11 9H17C18.6569 9 20 10.3431 20 12V24C20 25.6569 18.6569 27 17 27H8V12Z" fill="#000000" fillOpacity="0.3"/>
        <rect y="7" width="18" height="18" rx="2" fill="url(#wordPaint4)"/>
        <path d="M15 11.0142H13.0523L11.5229 17.539L9.84967 11H8.20261L6.51634 17.539L5 11.0142H3L5.60131 21H7.3268L9 14.6879L10.6732 21H12.3987L15 11.0142Z" fill="white"/>
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

    