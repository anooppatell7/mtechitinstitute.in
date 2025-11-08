
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { EnrollModal } from "@/components/enroll-modal";
import { Award, Users, Briefcase } from "lucide-react";

export default function Hero() {
  return (
    <section
      className="relative bg-cover bg-center"
    >
       <div className="absolute inset-0 h-full w-full">
         <Image 
            src="https://res.cloudinary.com/dzr4xjizf/image/upload/v1757136324/ChatGPT_Image_Sep_5_2025_10_25_03_PM_w0e2ry.png"
            alt="MTech IT Institute classroom"
            fill
            className="object-cover"
            priority
         />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-black/30" />
      </div>

      <div className="container relative z-10 flex min-h-[80vh] flex-col items-center justify-center py-20 text-center text-white">
        <h1 className="font-headline text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl [text-shadow:0_3px_6px_rgba(0,0,0,0.6)]">
          MTech IT Institute
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-200 sm:text-xl [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">
          Your Gateway to Excellence in IT Training and Computer Courses.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium shadow-lg backdrop-blur-sm">
                <Award className="h-5 w-5 text-accent" />
                <span>20+ Years Of Experience</span>
            </div>
            <div className="flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium shadow-lg backdrop-blur-sm">
                <Users className="h-5 w-5 text-accent" />
                <span>1000+ Students Trained</span>
            </div>
            <div className="flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium shadow-lg backdrop-blur-sm">
                <Briefcase className="h-5 w-5 text-accent" />
                <span>Job-Ready IT Skills</span>
            </div>
        </div>

        <div className="mt-10">
          <EnrollModal>
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 transition-transform hover:scale-105 shadow-lg">Join Now & Build Your Future</Button>
          </EnrollModal>
        </div>
      </div>
    </section>
  );
}
