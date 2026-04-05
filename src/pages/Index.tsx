import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import SwapSection from "@/components/SwapSection";
import StakeSection from "@/components/StakeSection";
import AssetsSection from "@/components/AssetsSection";
import FeaturesSection from "@/components/FeaturesSection";
import WhyChooseSection from "@/components/WhyChooseSection";
import InvestorsSection from "@/components/InvestorsSection";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <ScrollReveal><SwapSection /></ScrollReveal>
      <ScrollReveal><StakeSection /></ScrollReveal>
      <ScrollReveal><AssetsSection /></ScrollReveal>
      <ScrollReveal><FeaturesSection /></ScrollReveal>
      <ScrollReveal><WhyChooseSection /></ScrollReveal>
      <ScrollReveal><InvestorsSection /></ScrollReveal>
      <Footer />
    </div>
  );
};

export default Index;
