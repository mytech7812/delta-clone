import { Shield, Clock, Monitor, Lock } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import heroPhone from "@/assets/hero-phone.png";
import dashboardDesktop from "@/assets/dashboard-desktop.png";
import HexPattern from "./ui/hex-pattern";

const FeaturesSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.3, 0.5, 0.7, 1], [8, -6, 0, 4, -2]);
  const rotateY = useTransform(scrollYProgress, [0, 0.3, 0.5, 0.7, 1], [-4, 6, 0, -3, 2]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.97, 1.02, 0.98]);

  return (
    <section ref={sectionRef} className="py-16 md:py-24 bg-background">
      <div className="container">
        <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 text-center">
          Explore the power of AnexmintMining
        </h2>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          Built for security, speed, and simplicity
        </p>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Passkey Protection */}
          <div className="relative bg-card border border-border rounded-2xl p-6 md:p-8 overflow-hidden group hover:border-primary/30 transition-colors">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_30%,hsl(var(--primary))_0%,transparent_60%)]" />
            <HexPattern className="z-0 text-muted-foreground/40" opacity={0.06} />
            <div className="relative z-10">
              <h3 className="text-xl md:text-2xl font-bold text-primary mb-1">Passkey</h3>
              <h3 className="text-xl md:text-2xl font-bold text-primary mb-4">protection</h3>
              <Shield className="w-10 h-10 text-primary/60 mb-4" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                Secure your wallet with a device-based passkey, no passwords needed.
              </p>
            </div>
          </div>

          {/* 24/7 Customer Support */}
          <div className="relative bg-card border border-border rounded-2xl p-6 md:p-8 overflow-hidden flex flex-col items-center justify-center text-center group hover:border-primary/30 transition-colors">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_40%,hsl(var(--primary))_0%,transparent_50%)]" />
            <HexPattern className="z-0 text-muted-foreground/40" opacity={0.06} />
            <div className="relative z-10">
              <div className="bg-accent rounded-xl px-6 py-4 mb-4 inline-block">
                <span className="text-3xl md:text-4xl font-extrabold text-foreground">24/7</span>
              </div>
              <p className="text-lg md:text-xl font-semibold text-muted-foreground">
                Customer Support
              </p>
              {/* Avatars row */}
              <div className="flex items-center justify-center gap-[-8px] mt-6">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-accent border-2 border-card -ml-2 first:ml-0 flex items-center justify-center"
                  >
                    <Clock className="w-4 h-4 text-primary/60" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* User-friendly interface - with device images */}
          <div className="relative bg-card border border-border rounded-2xl p-6 md:p-8 overflow-hidden group hover:border-primary/30 transition-colors row-span-2">
            <HexPattern className="z-0 text-muted-foreground/40" opacity={0.06} />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl md:text-2xl font-bold text-foreground">User-friendly</h3>
                <span className="text-xs border border-border rounded-full px-3 py-1 text-muted-foreground font-medium">
                  SECURE
                </span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">interface</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Monitor prices, track performance, buy and sell, and swap between thousands of pairs.
              </p>
              {/* Device mockups with 3D effect */}
              <div className="relative flex justify-center" style={{ perspective: 900 }}>
                {/* Phone - mobile */}
                <motion.img
                  src={heroPhone}
                  alt="AnexmintMining mobile app"
                  className="w-32 md:hidden rounded-lg drop-shadow-xl"
                  style={{ rotateX, rotateY, scale }}
                />
                {/* Desktop - larger screens */}
                <motion.img
                  src={dashboardDesktop}
                  alt="AnexmintMining dashboard"
                  className="hidden md:block w-full max-w-[340px] rounded-lg drop-shadow-xl"
                  style={{
                    rotateX,
                    rotateY,
                    scale,
                    width: "115%",
                    maxWidth: "391px",
                    WebkitMaskImage: "linear-gradient(180deg, black 75%, transparent 100%)",
                    maskImage: "linear-gradient(180deg, black 75%, transparent 100%)",
                  }}
                />
                {/* Bottom fade overlay to blend image into background on larger screens */}
                <div
                  className="hidden md:block absolute left-0 right-0 bottom-0 h-28 pointer-events-none"
                  style={{
                    background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, hsl(var(--background)) 100%)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Advanced Security */}
          <div className="relative bg-card border border-border rounded-2xl p-6 md:p-8 overflow-hidden md:col-span-2 group hover:border-primary/30 transition-colors">
            <HexPattern className="z-0 text-muted-foreground/40" opacity={0.06} />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-1">
                <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                  Advanced security
                </h3>
                <h3 className="text-xl md:text-2xl font-bold text-foreground mb-4">made easy</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Securely manage and swap crypto with hardware wallet integration. Your keys stay on your device, always.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center">
                  <Lock className="w-8 h-8 text-primary" />
                </div>
                <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center">
                  <Monitor className="w-8 h-8 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
