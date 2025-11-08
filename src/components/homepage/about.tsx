import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "../ui/button";

export default function About() {
  return (
    <section className="py-16 sm:py-24 bg-secondary/50">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-headline text-3xl font-bold text-primary sm:text-4xl">
              Unlock Your Potential with Patti's Best IT Training Institute
            </h2>
            <p className="mt-4 text-lg text-foreground/80">
              At MTech IT Institute in Patti, Pratapgarh, we are committed to providing high-quality, industry-relevant training in a wide range of computer and IT courses. Our mission is to equip students with the skills and knowledge they need to thrive in the ever-evolving tech landscape.
            </p>
            <p className="mt-4 text-foreground/80">
              Whether you are a beginner looking to start your journey in IT, or a professional aiming to upgrade your skills, our <Link href="/courses" className="text-accent font-semibold hover:underline">comprehensive computer courses</Link> and experienced instructors are here to guide you every step of the way. We focus on practical, hands-on learning to ensure you are job-ready from day one.
            </p>
            <div className="mt-8">
                <Button asChild>
                    <Link href="/about">Learn More About Us</Link>
                </Button>
            </div>
          </div>
          <div className="w-full">
            <Card className="overflow-hidden shadow-2xl rounded-xl border-4 border-white">
              <CardContent className="p-0">
                <Image
                  src="https://res.cloudinary.com/dzr4xjizf/image/upload/v1757136324/ChatGPT_Image_Sep_5_2025_10_25_03_PM_w0e2ry.png"
                  alt="MTech IT Institute Certificate of Completion for computer courses"
                  data-ai-hint="certificate award"
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
