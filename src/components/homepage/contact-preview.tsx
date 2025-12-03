
import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContactPreview() {
  return (
    <section className="py-16 sm:py-24 bg-secondary">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-headline text-3xl font-bold text-primary sm:text-4xl">Get In Touch</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-primary/80">
            We're here to help you on your learning journey. Contact us for any queries about our computer courses.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-full text-accent">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary">Our Address</h3>
                <p className="text-primary/80">Patti Pratapgarh, 230135, Uttar Pradesh.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-full text-accent">
                <Phone className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary">Call Us</h3>
                <p className="text-primary/80">7800413348, 8299809562</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-full text-accent">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary">Email Us</h3>
                <p className="text-primary/80">mtechitinstitute@gmail.com</p>
              </div>
            </div>
            <div className="pt-4">
                <Button asChild>
                    <Link href="/contact">Send us a Message</Link>
                </Button>
            </div>
          </div>
          <div className="rounded-lg overflow-hidden shadow-lg border">
            <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3591.319152288344!2d82.2033033750868!3d25.826207477313364!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399a6015560731a5%3A0x8e83b6b3c668615!2sMTech%20IT%20Institute%20-%20Best%20Computer%20Institute%20in%20Patti%2C%20Pratapgarh!5e0!3m2!1sen!2sin!4v1758500057404!5m2!1sen!2sin"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="MTech IT Institute Location Map"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
}
