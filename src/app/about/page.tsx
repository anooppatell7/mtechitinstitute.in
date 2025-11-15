
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Award, BookOpen, Building, CheckCircle, GraduationCap, HeartHandshake, Lightbulb, Presentation, Target, UserCheck, Users, Vote } from "lucide-react";
import type { Metadata } from "next";
import SectionDivider from "@/components/section-divider";
import { Button } from "@/components/ui/button";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mtechitinstitute.in";

export const metadata: Metadata = {
  title: "About MTech IT Institute - Best Computer Center in Patti",
  description: "Learn about MTech IT Institute, Patti's leading computer training center. Our mission is to provide top-quality, job-oriented IT education and empower students for the digital world.",
  keywords: ["about mtech it institute", "computer institute patti", "our mission", "why choose us", "computer training pratapgarh", "IT education"],
  alternates: {
    canonical: `${siteUrl}/about`,
  },
  openGraph: {
    title: "About MTech IT Institute - Best Computer Center in Patti",
    description: "Learn about MTech IT Institute, Patti's leading computer training center. Our mission is to provide top-quality IT education and job-oriented courses.",
    url: `${siteUrl}/about`,
    images: [{
        url: "https://res.cloudinary.com/dzr4xjizf/image/upload/v1757136324/ChatGPT_Image_Sep_5_2025_10_25_03_PM_w0e2ry.png",
        width: 1200,
        height: 630,
        alt: "MTech IT Institute Classroom"
    }]
  },
};


const whyChooseUsItems = [
    {
        icon: <UserCheck className="h-8 w-8 text-accent" />,
        title: "Practical, Hands-On Training",
        description: "We focus more on doing rather than just memorizing. Every student gets real practice on systems and tools.",
    },
    {
        icon: <GraduationCap className="h-8 w-8 text-accent" />,
        title: "Experienced & Supportive Instructors",
        description: "Our trainers are skilled professionals who explain concepts in simple, easy-to-understand language.",
    },
    {
        icon: <Award className="h-8 w-8 text-accent" />,
        title: "Industry-Based Curriculum",
        description: "Our courses are designed according to the latest market trends and job requirements to ensure you learn what matters.",
    },
    {
        icon: <HeartHandshake className="h-8 w-8 text-accent" />,
        title: "Individual Attention",
        description: "We keep our batch sizes small to ensure every student gets personal support and doubt-clearing sessions.",
    },
];

const infrastructureItems = [
    { icon: <Building className="h-6 w-6 text-accent" />, text: "Fully equipped computer lab" },
    { icon: <CheckCircle className="h-6 w-6 text-accent" />, text: "High-speed internet connectivity" },
    { icon: <Presentation className="h-6 w-6 text-accent" />, text: "Modern systems with updated software" },
    { icon: <Users className="h-6 w-6 text-accent" />, text: "Comfortable classroom environment" },
    { icon: <BookOpen className="h-6 w-6 text-accent" />, text: "Project-based learning approach" },
];


export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <div className="bg-secondary relative">
         <SectionDivider style="wave" className="text-background" position="top"/>
        <div className="container py-16 sm:py-24 text-center">
          <h1 className="font-headline text-4xl font-bold text-primary sm:text-5xl">Welcome to MTech IT Institute</h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-primary/80">
            One of Patti’s most trusted and fastest-growing computer training institutes, empowering students for a successful career in today’s digital world.
          </p>
        </div>
      </div>
      
      {/* Mission & Vision */}
      <div className="bg-background relative">
         <SectionDivider style="wave" className="text-secondary" position="top"/>
         <div className="container py-16 sm:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                     <div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-primary/10 rounded-full text-accent"><Target className="h-7 w-7" /></div>
                            <h2 className="font-headline text-3xl font-bold text-primary">Our Mission</h2>
                        </div>
                        <p className="text-foreground/80">
                           Our mission is to make quality computer education accessible to everyone. We focus on job-oriented training, practical learning through real-world projects, and building confidence by strengthening core computer skills to bridge the gap between academia and industry.
                        </p>
                     </div>
                     <div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-primary/10 rounded-full text-accent"><Lightbulb className="h-7 w-7" /></div>
                            <h2 className="font-headline text-3xl font-bold text-primary">Our Vision</h2>
                        </div>
                        <p className="text-foreground/80">
                            To become the most trusted computer training center in the region by offering advanced IT education that prepares students for a bright and successful future in technology.
                        </p>
                     </div>
                </div>
                 <div className="w-full">
                    <Card className="overflow-hidden shadow-xl rounded-lg border-t-4 border-t-accent">
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
      
       {/* Our Story */}
      <div className="bg-secondary relative">
        <SectionDivider style="wave" className="text-background" position="top"/>
        <div className="container py-16 sm:py-24">
            <div className="text-center mb-12 max-w-3xl mx-auto">
                 <h2 className="font-headline text-3xl font-bold text-primary sm:text-4xl">Our Story</h2>
                 <p className="mt-4 text-lg font-semibold text-primary/80 italic">"To provide high-quality, affordable computer education in Patti, Pratapgarh."</p>
                 <p className="mt-2 text-foreground/80">
                    MTech IT Institute was started with this simple goal. We noticed many talented students lacked proper training and guidance, so we created a space where learning is practical, easy to understand, and updated with the latest technology — all at a price that's affordable for everyone.
                 </p>
            </div>
        </div>
      </div>


      {/* Why Choose Us */}
      <div className="bg-background relative">
        <SectionDivider style="wave" className="text-secondary" position="top"/>
        <div className="container py-16 sm:py-24">
          <div className="text-center mb-12">
            <h2 className="font-headline text-3xl font-bold text-primary sm:text-4xl">Why Choose MTech IT Institute?</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-primary/80">
              We provide a learning environment that is not just educational, but also transformative.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseUsItems.map((item, index) => (
              <Card key={index} className="text-center shadow-md hover:shadow-xl transition-shadow duration-300 bg-card border-t-4 border-t-accent">
                <CardHeader>
                  <div className="flex justify-center mb-4">{item.icon}</div>
                  <CardTitle className="font-headline text-xl text-primary font-semibold">{item.title}</CardTitle>
                  <CardDescription className="pt-2 text-foreground/80">{item.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
      
       {/* Infrastructure & Faculty */}
      <div className="bg-secondary relative">
         <SectionDivider style="wave" className="text-background" position="top"/>
         <div className="container py-16 sm:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                 <div>
                    <h2 className="font-headline text-3xl font-bold text-primary sm:text-4xl mb-6">Our Infrastructure</h2>
                    <div className="space-y-4">
                        {infrastructureItems.map(item => (
                             <div key={item.text} className="flex items-center gap-4 bg-background p-4 rounded-lg shadow-sm">
                                {item.icon}
                                <span className="font-medium text-primary/90">{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
                 <div>
                    <h2 className="font-headline text-3xl font-bold text-primary sm:text-4xl mb-6">Our Faculty</h2>
                     <p className="text-foreground/80 text-lg">
                        Our trainers are experienced professionals with strong technical backgrounds. They use simple teaching methods, real-world examples, and practical demonstrations to ensure every student understands concepts clearly and confidently.
                    </p>
                </div>
            </div>
         </div>
      </div>
      
       {/* Commitment Section */}
       <div className="bg-background relative">
          <SectionDivider style="wave" className="text-secondary" position="top"/>
           <div className="container py-16 sm:py-24 text-center">
                <HeartHandshake className="h-16 w-16 text-accent mx-auto mb-6" />
                <h2 className="font-headline text-3xl font-bold text-primary sm:text-4xl">Our Commitment to You</h2>
                <p className="mt-4 max-w-3xl mx-auto text-lg text-primary/80 italic">
                    At MTech IT Institute, we don’t just teach — we mentor, guide, and support you until you are ready for the real world. Your success is our biggest achievement.
                </p>
                <div className="mt-8">
                    <Button size="lg" asChild>
                        <Link href="/contact">Start Your Journey Today</Link>
                    </Button>
                </div>
           </div>
       </div>
    </>
  );
}
