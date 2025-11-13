
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Users, IndianRupee } from "lucide-react";
import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mtechitinstitute.in";

export const metadata: Metadata = {
  title: "About MTech IT Institute - Best Computer Center in Patti",
  description: "Learn about MTech IT Institute, Patti's leading computer training center. Our mission is to provide top-quality IT education and job-oriented courses.",
  keywords: ["about mtech it institute", "computer institute patti", "our mission", "why choose us"],
  alternates: {
    canonical: `${siteUrl}/about`,
  },
  openGraph: {
    title: "About MTech IT Institute - Best Computer Center in Patti",
    description: "Learn about MTech IT Institute, Patti's leading computer training center. Our mission is to provide top-quality IT education and job-oriented courses.",
    url: `${siteUrl}/about`,
  },
};


const highlights = [
  {
    icon: <GraduationCap className="h-10 w-10 text-accent" />,
    title: "Experienced Teachers",
    description: "Learn from industry experts with years of practical experience and a passion for teaching.",
  },
  {
    icon: <Users className="h-10 w-10 text-accent" />,
    title: "1000+ Trained Students",
    description: "Join a growing community of successful professionals who started their journey with us.",
  },
  {
    icon: <IndianRupee className="h-10 w-10 text-accent" />,
    title: "Affordable Fees",
    description: "We believe in accessible education, offering high-quality courses at competitive prices.",
  },
];


export default function AboutPage() {
  return (
    <>
      <div className="bg-background">
        <div className="container py-16 sm:py-24 text-center">
          <h1 className="font-headline text-4xl font-bold text-primary sm:text-5xl">About MTech IT Institute</h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-primary/80">
            Empowering the next generation of IT professionals with quality education and practical skills in Patti, Pratapgarh.
          </p>
        </div>
      </div>
      
      <div className="bg-secondary">
        <div className="container py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-headline text-3xl font-bold text-primary sm:text-4xl">
                Our Mission
              </h2>
              <p className="mt-4 text-lg text-foreground/80">
                At MTech IT Institute, our mission is to bridge the gap between academic learning and industry demands. We are committed to providing high-quality, job-oriented training in a wide range of computer and IT courses. We aim to equip our students with the technical skills and confidence they need to succeed in the fast-paced world of technology.
              </p>
              <p className="mt-4 text-foreground/80">
                We believe in practical, hands-on learning. Our curriculum is designed by industry experts to be relevant, up-to-date, and focused on real-world applications. Whether you are a student starting your career or a professional looking to upskill, we provide a supportive and engaging learning environment.
              </p>
            </div>
            <div className="w-full">
              <Card className="overflow-hidden shadow-lg rounded-lg">
                <CardContent className="p-0">
                  <Image
                    src="https://res.cloudinary.com/dzr4xjizf/image/upload/v1757136324/ChatGPT_Image_Sep_5_2025_10_25_03_PM_w0e2ry.png"
                    alt="MTech IT Institute classroom with students"
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
      </div>

      <div className="bg-background">
        <div className="container py-16 sm:py-24">
          <div className="text-center mb-12">
            <h2 className="font-headline text-3xl font-bold text-primary sm:text-4xl">Why Choose Us?</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-primary/80">
              We provide a learning environment that is not just educational, but also transformative.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {highlights.map((highlight, index) => (
              <Card key={index} className="text-center shadow-md hover:shadow-xl transition-shadow duration-300 bg-card">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">{highlight.icon}</div>
                  <h3 className="font-headline text-xl text-primary font-semibold">{highlight.title}</h3>
                  <p className="pt-2 text-foreground/80">{highlight.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
