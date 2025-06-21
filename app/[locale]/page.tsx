import AboutSection from "@/components/HomePage/AboutSection";
import HeroSection from "@/components/HomePage/HeroSection";
import ServicesSection from "@/components/HomePage/ServicesSection";
import ContactForm from "@/components/ContactForm";

export default function Home() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <ContactForm />
    </>
  );
}
