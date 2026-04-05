import { Droplets, BadgeDollarSign, ShieldCheck, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";

const reasons = [
  {
    icon: Droplets,
    title: "Best Liquidity",
    description: "Our order book has the tightest spreads in the industry with up to 100x leverage.",
  },
  {
    icon: BadgeDollarSign,
    title: "Lowest Fees",
    description: "Industry-leading low fees across all trading pairs and transaction types.",
  },
  {
    icon: ShieldCheck,
    title: "Safe & Secure",
    description: "Enterprise-grade multi-factor security. All withdrawals manually reviewed.",
  },
  {
    icon: Headphones,
    title: "24x7 Support",
    description: "90% of support queries resolved in under 24 hours by our dedicated team.",
  },
];

const WhyChooseSection = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-center">
          Why Choose AnexmintMining?
        </h2>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          AnexmintMining is the best place to trade, swap, and earn with crypto assets.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {reasons.map((reason) => (
            <div key={reason.title} className="text-center space-y-4 p-6">
              <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mx-auto">
                <reason.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{reason.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{reason.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center bg-primary rounded-2xl p-8 md:p-12">
          <p className="text-primary-foreground/80 text-lg mb-4">
            Don't have an account yet? Sign up in 30s and start your crypto journey.
          </p>
          <Button size="lg" variant="secondary" className="font-semibold px-8 rounded-full">
            Sign Up Now
          </Button>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;
