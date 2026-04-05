import { Layers, Wallet, BarChart3, Package, TrendingUp, Target } from "lucide-react";

const features = [
  {
    icon: Layers,
    title: "Multi-Chain Support",
    description: "Trade across multiple blockchains seamlessly from one unified dashboard.",
  },
  {
    icon: Wallet,
    title: "Self-Custody Wallet",
    description: "Your keys, your crypto. Full control of your assets at all times.",
  },
  {
    icon: BarChart3,
    title: "Portfolio Analytics",
    description: "Track your portfolio performance with real-time charts and insights.",
  },
  {
    icon: Package,
    title: "Batch Transactions",
    description: "Execute multiple transactions simultaneously to save time and gas fees.",
  },
  {
    icon: TrendingUp,
    title: "Live Market Data",
    description: "Real-time price feeds and market data across all supported assets.",
  },
  {
    icon: Target,
    title: "Price Alerts",
    description: "Set custom alerts and never miss a trading opportunity again.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-16 md:py-24 bg-secondary">
      <div className="container">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-center">
          Powerful Features
        </h2>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          Everything you need to manage your crypto portfolio like a pro
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-card rounded-xl p-6 border border-border hover:border-primary/30 hover:shadow-lg transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
