
import ContactForm from "@/components/contact-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Facebook, Instagram, Send, Phone, Mail, MapPin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import SectionDivider from "@/components/section-divider";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mtechitinstitute.in";

export const metadata: Metadata = {
  title: "Contact MTech IT Institute - Computer Center in Patti",
  description: "Contact MTech IT Institute for admissions, course details, or any inquiry. We're the leading computer training center in Patti, Pratapgarh. Call 7800413348.",
  keywords: ["computer training institute contact patti", "MTech IT Institute address", "MTech IT Institute phone number", "join MTech IT Institute patti", "computer center in patti pratapgarh"],
   alternates: {
    canonical: `${siteUrl}/contact`,
  },
  openGraph: {
    title: "Contact MTech IT Institute - Computer Center in Patti",
    description: "Contact MTech IT Institute for admissions, course details, or any inquiry. We're the leading computer training center in Patti, Pratapgarh.",
    url: `${siteUrl}/contact`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Contact MTech IT Institute - Computer Center in Patti",
    description: "Contact MTech IT Institute for admissions, course details, or any inquiry. We're the leading computer training center in Patti, Pratapgarh.",
  },
};

export default function ContactPage() {
  return (
    <>
      <div className="bg-background">
        <div className="container py-16 sm:py-24 text-center">
          <h1 className="font-headline text-4xl font-bold text-primary sm:text-5xl">Contact Us</h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-primary/80">
            Have questions about our computer courses in Patti? We'd love to hear from you.
          </p>
        </div>
      </div>
      
      <div className="bg-secondary relative">
        <SectionDivider style="wave" className="text-background" position="top"/>
        <div className="container py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            <div className="lg:col-span-3">
              <Card className="bg-background">
                <CardHeader>
                  <CardTitle className="font-headline text-2xl">Send a Message</CardTitle>
                  <CardDescription>Fill out the form below and our team will get back to you shortly.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ContactForm />
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-8">
              <Card className="bg-background">
                <CardHeader>
                   <CardTitle className="font-headline text-2xl">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-accent" />
                    <span>Patti Pratapgarh, 230135, Uttar Pradesh.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-accent" />
                    <span>7800413348, 8299809562</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-accent" />
                    <span>mtechitinstitute@gmail.com</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-background">
                  <CardHeader>
                      <CardTitle className="font-headline text-xl">Follow Us</CardTitle>
                  </CardHeader>
                  <CardContent>
                       <div className="flex space-x-4">
                          <Link href="#" aria-label="WhatsApp" className="p-3 bg-primary/10 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors">
                              <Send className="w-6 h-6" />
                          </Link>
                          <Link href="#" aria-label="Facebook" className="p-3 bg-primary/10 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors">
                              <Facebook className="w-6 h-6" />
                          </Link>
                          <Link href="#" aria-label="Instagram" className="p-3 bg-primary/10 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors">
                              <Instagram className="w-6 h-6" />
                          </Link>
                      </div>
                  </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="mt-16">
              <div className="rounded-lg overflow-hidden shadow-lg">
                  <Image
                      src="https://res.cloudinary.com/dzr4xjizf/image/upload/v1757137831/map1_gah3hr.png"
                      alt="Google Map showing MTech IT Institute location in Patti, Pratapgarh"
                      data-ai-hint="map satellite"
                      width={1200}
                      height={400}
                      className="w-full h-auto"
                  />
              </div>
          </div>
        </div>
      </div>
    </>
  );
}
