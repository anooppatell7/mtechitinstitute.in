
import Hero from "@/components/homepage/hero";
import About from "@/components/homepage/about";
import Highlights from "@/components/homepage/highlights";
import ContactPreview from "@/components/homepage/contact-preview";
import FeaturedCourses from "@/components/homepage/featured-courses";
import Testimonials from "@/components/homepage/testimonials";
import SectionDivider from "@/components/section-divider";
import { getPopupSettings } from "@/lib/firebase";
import SalesPopup from "@/components/sales-popup";

export default async function Home() {
  const popupSettings = await getPopupSettings();

  return (
    <>
      {popupSettings?.isVisible && <SalesPopup settings={popupSettings} />}
      <Hero />
      <div className="relative">
        <About />
        <SectionDivider style="wave" className="text-background" />
      </div>
      <div className="relative">
        <Highlights />
        <SectionDivider style="wave" className="text-secondary/50" />
      </div>
       <div className="relative">
        <FeaturedCourses />
        <SectionDivider style="wave" className="text-background" />
      </div>
      <div className="relative">
        <Testimonials />
        <SectionDivider style="wave" className="text-secondary" />
      </div>
      <ContactPreview />
    </>
  );
}
