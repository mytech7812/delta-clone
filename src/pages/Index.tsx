import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
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
import SignInModal from "@/components/SignInModal";

const Index = () => {
  const location = useLocation();
  const [signInOpen, setSignInOpen] = useState(false);

  useEffect(() => {
    if ((location.state as { openSignIn?: boolean })?.openSignIn) {
      const timer = setTimeout(() => setSignInOpen(true), 150);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar onLoginClick={() => setSignInOpen(true)} />
      <HeroSection />
      <ScrollReveal><SwapSection /></ScrollReveal>
      <ScrollReveal><StakeSection /></ScrollReveal>
      <ScrollReveal><AssetsSection /></ScrollReveal>
      <ScrollReveal><FeaturesSection /></ScrollReveal>
      <ScrollReveal><WhyChooseSection /></ScrollReveal>
      <ScrollReveal><InvestorsSection /></ScrollReveal>
      <Footer />
      <SignInModal isOpen={signInOpen} onClose={() => setSignInOpen(false)} />
    </div>
  );
};

export default Index;
