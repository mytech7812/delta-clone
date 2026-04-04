import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import MarketsSection from "@/components/MarketsSection";
import FeaturesSection from "@/components/FeaturesSection";
import WhyChooseSection from "@/components/WhyChooseSection";
import InvestorsSection from "@/components/InvestorsSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <MarketsSection />
      <FeaturesSection />
      <WhyChooseSection />
      <InvestorsSection />
      <Footer />
    </div>
  );
};

export default Index;
