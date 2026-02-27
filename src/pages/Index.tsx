import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AITeamSection from "@/components/AITeamSection";
import CapabilitiesGrid from "@/components/CapabilitiesGrid";
import HowItWorks from "@/components/HowItWorks";
import DashboardPreview from "@/components/DashboardPreview";
import IndustriesSection from "@/components/IndustriesSection";
import ComparisonSection from "@/components/ComparisonSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import PricingSection from "@/components/PricingSection";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <DashboardPreview />
      <AITeamSection />
      <CapabilitiesGrid />
      <HowItWorks />
      <IndustriesSection />
      <ComparisonSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
