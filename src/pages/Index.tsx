import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import PainSection from "@/components/PainSection";
import HowItWorks from "@/components/HowItWorks";
import CoreOutcomes from "@/components/CoreOutcomes";
import ProofWorkflow from "@/components/ProofWorkflow";
import WhoItsFor from "@/components/WhoItsFor";
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
      <PainSection />
      <HowItWorks />
      <CoreOutcomes />
      <ProofWorkflow />
      <WhoItsFor />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
