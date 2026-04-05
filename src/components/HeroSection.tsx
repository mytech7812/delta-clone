import { useRef } from "react";
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

  // 3D tilt: tilts as you scroll past, returns to normal
  const rotateX = useTransform(scrollYProgress, [0, 0.3, 0.5, 0.7, 1], [0, 12, 0, -8, 0]);
  const rotateY = useTransform(scrollYProgress, [0, 0.3, 0.5, 0.7, 1], [0, -6, 0, 4, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.02, 1]);

  return (
    <section className="relative overflow-hidden">
      <div className="container py-12 md:py-24">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
              Trade Crypto Futures & Options
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg">
              Call & Put Options on BTC & ETH.<br />
              Perpetuals on BTC, ETH and 50+ Alts
            </p>
            {/* Full-width rounded button on mobile, normal on desktop */}
            <Button
              size="lg"
              className="w-full md:w-auto text-base font-semibold px-8 py-6 rounded-full"
            >
              Sign Up Now
            </Button>
          </div>

          {/* Hero image with 3D scroll effect */}
          <div ref={imageRef} className="relative flex justify-center" style={{ perspective: 1200 }}>
            <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl scale-75" />
            {/* Phone image: mobile only, scaled up 30% */}
            <motion.img
              src={heroPhone}
              alt="AnexmintMining trading app"
              width={500}
              height={500}
              className="relative z-10 w-[130%] max-w-[520px] drop-shadow-2xl md:hidden"
              style={{
                rotateX,
                rotateY,
                scale,
              }}
            />
            {/* Desktop dashboard image: md+ only */}
            <motion.img
              src={dashboardDesktop}
              alt="AnexmintMining dashboard"
              className="relative z-10 w-full max-w-[600px] rounded-xl drop-shadow-2xl hidden md:block"
              style={{
                rotateX,
                rotateY,
                scale,
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
