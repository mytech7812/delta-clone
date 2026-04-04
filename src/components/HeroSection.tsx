import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import heroPhone from "@/assets/hero-phone.png";

const highlights = [
  "Crypto Deposits & Withdrawals",
  "Daily and Weekly expiry contracts",
  "Trade with versatile margining",
  "Trading Market available 24/7",
];

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="container py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
              Trade Crypto Futures & Options
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg">
              Call & Put Options on BTC & ETH.<br />
              Perpetuals on BTC, ETH and 50+ Alts
            </p>
            <Button size="lg" className="text-base font-semibold px-8 py-6 rounded-lg">
              Sign Up Now
            </Button>
          </div>
          <div className="relative flex justify-center">
            <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl scale-75" />
            <img
              src={heroPhone}
              alt="Delta Exchange trading app"
              width={500}
              height={500}
              className="relative z-10 max-w-[400px] md:max-w-[500px] w-full drop-shadow-2xl"
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
