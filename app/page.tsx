import ContactForm from "@/components/ContactForm";
import AboutSection from "@/components/HomePage/AboutSection";
import HeroSection from "@/components/HomePage/HeroSection";
import ServicesSection from "@/components/HomePage/ServicesSection";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <ContactForm />
    </div>
  );
}
