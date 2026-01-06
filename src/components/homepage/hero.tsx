
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Award, Users, Briefcase, Rocket, Smartphone } from "lucide-react";
import SectionDivider from "../section-divider";

export default function Hero() {
  return (
    <section className="relative w-full bg-gradient-to-br from-indigo-600 via-blue-500 to-cyan-400">
      <div className="container relative z-10 flex min-h-[90vh] flex-col items-center justify-center py-20 text-center">
        <h1 className="font-headline text-5xl font-bold text-white drop-shadow-md sm:text-6xl lg:text-7xl">
          Master Computer Skills<span className="text-green-300">.</span> Build Your Future<span className="text-green-300">.</span>
        </h1>
        <p className="mt-6 max-w-[700px] text-lg text-blue-50 sm:text-xl">
          From Basics to Advanced IT Training — All in One Place. Learn,
          Practice, and Grow with MTech IT Institute.
        </p>

        <div className="mt-10 flex flex-wrap justify-center items-center gap-4">
          <Button
            asChild
            size="lg"
            className="h-auto bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:opacity-90 transition-all transform hover:scale-105 rounded-full px-8 py-4 text-base font-semibold shadow-lg shadow-blue-500/30"
          >
            <Link href="/learn">
                Start Learning
                <Rocket className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-auto rounded-full border-2 border-white bg-transparent text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white px-8 py-4 text-base font-semibold"
          >
            <Link href="/courses">View Courses</Link>
          </Button>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-white">
                <Award className="h-5 w-5 text-green-300" />
                <span>20+ Years Of Experience</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-white">
                <Users className="h-5 w-5 text-green-300" />
                <span>1000+ Students Trained</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-white">
                <Briefcase className="h-5 w-5 text-green-300" />
                <span>Job-Ready IT Skills</span>
            </div>
        </div>

      </div>
      <SectionDivider style="wave" className="text-secondary/50" />
    </section>
  );
}
