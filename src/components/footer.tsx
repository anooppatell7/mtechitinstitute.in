
"use client";

import Link from "next/link";
import { Facebook, Instagram, Phone, Mail, MapPin, Send } from "lucide-react";
import Logo from "./logo";
import { useEffect, useState } from "react";

export default function Footer() {
  const appDownloadLink = "/mtech-it-institute.apk";

  const quickLinks = [
    { title: "Home", href: "/" },
    { title: "About", href: "/about" },
    { title: "Courses", href: "/courses" },
    { title: "Learn", href: "/learn" },
    { title: "Blog", href: "/blog" },
  ];

  const secondaryLinks = [
    { title: "Career Guidance", href: "/career" },
    { title: "Resources", href: "/resources" },
    { title: "Reviews", href: "/reviews" },
    { title: "Verify Certificate", href: "/verify-certificate" },
    { title: "Download App", href: appDownloadLink },
    { title: "Privacy Policy", href: "/privacy-policy" },
    { title: "Terms & Conditions", href: "/terms-and-conditions" },
  ];
  
  return (
    <footer className="bg-secondary text-secondary-foreground border-t">
      <div className="container py-12">
        
        {/* Top Section: Logo and Description */}
        <div className="text-center md:text-left mb-10">
            <div className="flex justify-center md:justify-start">
              <Logo />
            </div>
            <p className="text-sm max-w-md mt-4 mx-auto md:mx-0">
              MTech IT Institute is dedicated to providing top-quality IT training and computer courses to empower students for a successful career in technology.
            </p>
        </div>

        {/* Middle Section: Links and Contact */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10 text-center md:text-left">
            {/* Contact Info */}
            <div className="space-y-4">
                 <h3 className="font-headline text-lg font-semibold">Contact Us</h3>
                 <div className="flex items-center justify-center md:justify-start gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-accent flex-shrink-0 mt-1"/>
                    <span>Patti Pratapgarh, 230135, Uttar Pradesh.</span>
                </div>
                 <div className="flex items-center justify-center md:justify-start gap-3 text-sm">
                    <Phone className="w-4 h-4 text-accent flex-shrink-0"/>
                    <span>7800413348, 8299809562</span>
                </div>
                 <div className="flex items-center justify-center md:justify-start gap-3 text-sm">
                    <Mail className="w-4 h-4 text-accent flex-shrink-0"/>
                    <span>mtechitinstitute@gmail.com</span>
                </div>
            </div>

            {/* Links Section - two columns */}
            <div className="md:col-span-2">
                 <h3 className="font-headline text-lg font-semibold mb-4">Quick Links</h3>
                 <div className="grid grid-cols-2 gap-4 text-sm">
                    <ul className="space-y-2">
                        {quickLinks.map((item) => (
                            <li key={item.href}>
                            <Link href={item.href} className="hover:text-accent transition-colors">
                                {item.title}
                            </Link>
                            </li>
                        ))}
                    </ul>
                    <ul className="space-y-2">
                        {secondaryLinks.map((item) => (
                            <li key={item.href}>
                                <Link href={item.href} className="hover:text-accent transition-colors">
                                    {item.title}
                                </Link>
                            </li>
                        ))}
                    </ul>
                 </div>
            </div>
        </div>

        {/* Bottom Section: Socials and Copyright */}
        <div className="pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex space-x-4">
              <Link href="https://wa.me/918299809562" aria-label="WhatsApp" className="p-2 bg-primary/10 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors">
                <Send className="w-5 h-5" />
              </Link>
              <Link href="https://www.facebook.com/people/Mtech-it-institute/61562000094984/?mibextid=ZbWKwL" aria-label="Facebook" className="p-2 bg-primary/10 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link href="https://www.instagram.com/mtechitinstitute" aria-label="Instagram" className="p-2 bg-primary/10 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors">
                <Instagram className="w-5 h-5" />
              </Link>
            </div>
          <div className="text-sm text-center sm:text-right">
            <div>&copy; {new Date().getFullYear()} MTech IT Institute. All Rights Reserved.</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
