
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Award, Users, Briefcase } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative w-full bg-gradient-to-br from-indigo-600 via-blue-500 to-cyan-400">
      <div className="container relative z-10 flex min-h-[90vh] flex-col items-center justify-center py-20 text-center">
        <h1 className="font-headline text-5xl font-bold text-white drop-shadow-md sm:text-6xl lg:text-7xl">
          Master Computer Skills. Build Your Future.
        </h1>
        <p className="mt-6 max-w-[700px] text-lg text-blue-50 sm:text-xl">
          From Basics to Advanced IT Training — All in One Place. Learn,
          Practice, and Grow with MTech IT Institute.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="rounded-xl bg-white text-indigo-600 shadow-lg transition-transform hover:scale-105 hover:bg-indigo-100"
          >
            <Link href="/learn">Start Learning</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-xl border-2 border-white bg-transparent text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white"
          >
            <Link href="/courses">View Courses</Link>
          </Button>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                <Award className="h-5 w-5 text-white" />
                <span>20+ Years Of Experience</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                <Users className="h-5 w-5 text-white" />
                <span>1000+ Students Trained</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                <Briefcase className="h-5 w-5 text-white" />
                <span>Job-Ready IT Skills</span>
            </div>
        </div>

      </div>
      <div
        className="absolute bottom-0 left-0 h-40 w-full bg-gradient-to-t from-blue-600/20 to-transparent"
        aria-hidden="true"
      />
    </section>
  );
}
