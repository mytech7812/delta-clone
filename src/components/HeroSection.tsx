import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import heroPhone from "@/assets/hero-phone.png";
import dashboardDesktop from "@/assets/dashboard-desktop.png";

const highlights = [
  "Crypto Deposits & Withdrawals",
  "Daily and Weekly expiry contracts",
  "Trade with versatile margining",
  "Trading Market available 24/7",
];

const HeroSection = () => {
  const imageRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: imageRef,
    offset: ["start end", "end start"],
  });

  const navigate = useNavigate();

  // 3D tilt effects (applies to both)
  const rotateX = useTransform(scrollYProgress, [0, 0.3, 0.5, 0.7, 1], [0, 12, 0, -8, 0]);
  const rotateY = useTransform(scrollYProgress, [0, 0.3, 0.5, 0.7, 1], [0, -6, 0, 4, 0]);

  // More dramatic zoom (zooms to 1.3x)
  const scale = useTransform(scrollYProgress, [0.2, 0.5, 0.8], [1, 1.3, 1]);

  // Parallax movement (image moves opposite direction)
  const y = useTransform(scrollYProgress, [0.2, 0.5, 0.8], [0, -40, 0]);

  // Zoom effect only for mobile (using the dramatic scale)
  const mobileScale = scale;
  
  // Desktop keeps scale at 1 (no zoom)
  const desktopScale = 1;

  return (
    <section className="relative overflow-hidden">
      <div className="container py-12 md:py-24">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
              Crypto Trading made simple
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg">
              Call & Put Options on BTC & ETH.<br />
              Perpetuals on BTC, ETH and 50+ Alts
            </p>
            <Button
              size="lg"
              className="w-full md:w-auto text-base font-semibold px-8 py-6 rounded-full relative z-20"
              onClick={() => navigate("/signup")}
            >
              Sign Up Now
            </Button>
          </div>

          {/* Hero image with 3D scroll effect */}
          <div ref={imageRef} className="relative flex justify-center overflow-visible" style={{ perspective: 1200, overflow: 'visible' }}>
            <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl scale-75" />
            
            {/* Phone image - mobile only WITH zoom effect */}
            <motion.img
              src={heroPhone}
              alt="AnexmintMining trading app"
              width={500}
              height={500}
              className="relative z-10 w-[130%] max-w-[520px] drop-shadow-2xl md:hidden pointer-events-none"
              style={{
                rotateX,
                rotateY,
                scale: mobileScale,
                y,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
            />
            
            {/* Desktop dashboard image - NO zoom effect */}
            <motion.img
              src={dashboardDesktop}
              alt="AnexmintMining dashboard"
              className="relative z-10 w-[115%] max-w-[690px] rounded-xl drop-shadow-2xl hidden md:block"
              style={{
                rotateX,
                rotateY,
                scale: desktopScale,
                WebkitMaskImage: "linear-gradient(180deg, black 72%, transparent 100%)",
                maskImage: "linear-gradient(180deg, black 72%, transparent 100%)",
              }}
            />
            
            {/* Fade overlay */}
            <div
              className="hidden md:block absolute left-0 right-0 bottom-0 h-40 pointer-events-none z-20 rounded-b-xl"
              style={{
                background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, hsl(var(--background)) 90%)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Ticker bar */}
      <div className="bg-secondary border-y border-border">
        <div className="container py-4">
          <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-4 md:gap-8">
            {highlights.map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Star className="w-4 h-4 text-primary fill-primary" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;