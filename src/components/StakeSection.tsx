import { TrendingUp, Lock, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";

const stakingOptions = [
  { asset: "SOL", name: "Solana", apy: "7.2%", color: "hsl(260, 80%, 60%)" },
  { asset: "ETH", name: "Ethereum", apy: "4.8%", color: "hsl(220, 60%, 55%)" },
  { asset: "ATOM", name: "Cosmos", apy: "12.5%", color: "hsl(200, 70%, 50%)" },
  { asset: "DOT", name: "Polkadot", apy: "11.3%", color: "hsl(330, 70%, 55%)" },
];

const StakeSection = () => {
  return (
    <section id="staking" className="py-16 md:py-24 bg-secondary">
      <div className="container">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
            <Coins className="w-4 h-4" />
            Stake & Earn
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Earn Passive Income
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Stake your crypto and earn rewards. No lockup minimums, withdraw anytime. Your assets work for you 24/7.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stakingOptions.map((opt) => (
            <div
              key={opt.asset}
              className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 hover:shadow-lg transition-all group"
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg mb-4"
                style={{ backgroundColor: opt.color }}
              >
                {opt.asset.charAt(0)}
              </div>
              <div className="font-semibold text-foreground text-lg">{opt.name}</div>
              <div className="text-sm text-muted-foreground mb-3">{opt.asset}</div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-success" />
                <span className="text-success font-bold text-lg">{opt.apy}</span>
                <span className="text-xs text-muted-foreground ml-1">APY</span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button size="lg" className="rounded-full font-semibold px-8">
            Start Earning
          </Button>
        </div>
      </div>
    </section>
  );
};

export default StakeSection;
