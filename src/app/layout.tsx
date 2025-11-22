
import type { Metadata } from "next";
import { PT_Sans, Space_Grotesk, Great_Vibes } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Toaster } from "@/components/ui/toaster";
import { JsonLd } from "@/components/json-ld";
import { organizationSchema, websiteSchema } from "@/lib/schema";
import { getSiteSettings } from "@/lib/firebase";
import AnnouncementBar from "@/components/announcement-bar";
import { FirebaseClientProvider } from "@/firebase/client-provider";

const ptSans = PT_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-pt-sans",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-space-grotesk",
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-great-vibes",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://mtechitinstitute.in";

const faviconUrl = "https://res.cloudinary.com/dzr4xjizf/image/upload/v1757138798/mtechlogo_1_wsdhhx.png";

// This forces the layout to be dynamically rendered, ensuring data is always fresh
export const revalidate = 0;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default:
      "MTech IT Institute - Best Computer Institute in Patti, Pratapgarh",
    template: "%s | MTech IT Institute",
  },
  description:
    "Join MTech IT Institute, the best computer training center in Patti, Pratapgarh. We offer expert-led IT courses in Web Development, Digital Marketing, Tally, O-Level, CCC, PGDCA, and more to kickstart your tech career.",
  keywords: [
    "best computer institute in patti",
    "computer center in patti pratapgarh",
    "IT training institute patti",
    "computer courses patti",
    "after 12th career courses",
    "MTech IT Institute",
    "learn coding",
    "digital marketing courses",
    "web development course",
    "Tally course",
    "CCC course",
    "O-Level course",
    "PGDCA",
    "BCA",
    "Excel course",
    "Patti",
    "Pratapgarh",
  ],
  icons: {
    icon: faviconUrl,
    shortcut: faviconUrl,
    apple: faviconUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    title: "MTech IT Institute - Best Computer Institute in Patti, Pratapgarh",
    description:
      "Join MTech IT Institute, the best computer training center in Patti. Offering expert-led IT courses to kickstart your tech career.",
    images: [
      {
        url: "https://res.cloudinary.com/dzr4xjizf/image/upload/v1757136324/ChatGPT_Image_Sep_5_2025_10_25_03_PM_w0e2ry.png",
        width: 1200,
        height: 630,
        alt: "MTech IT Institute Classroom in Patti",
      },
    ],
    siteName: "MTech IT Institute",
  },
  twitter: {
    card: "summary_large_image",
    title: "MTech IT Institute - Best Computer Institute in Patti, Pratapgarh",
    description:
      "Join MTech IT Institute, the best computer training center in Patti. Offering expert-led IT courses to kickstart your tech career.",
    images: [
      "https://res.cloudinary.com/dzr4xjizf/image/upload/v1757136324/ChatGPT_Image_Sep_5_2025_10_25_03_PM_w0e2ry.png",
    ],
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const announcement = await getSiteSettings();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2296905809539851" crossOrigin="anonymous"></script>
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-body antialiased",
          ptSans.variable,
          spaceGrotesk.variable,
          greatVibes.variable
        )}
      >
        <JsonLd data={organizationSchema} />
        <JsonLd data={websiteSchema} />
        <FirebaseClientProvider>
          <div className="relative flex min-h-dvh flex-col bg-background">
            {announcement && announcement.isVisible && (
              <AnnouncementBar text={announcement.text} link={announcement.link} />
            )}
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
