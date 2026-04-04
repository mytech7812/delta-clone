import { Layers, Wallet, BarChart3, Package, TrendingUp, Target } from "lucide-react";

const features = [
  {
    icon: Layers,
    title: "Versatile Margining",
    description: "Trade with margin modes of your choice: Isolated, Portfolio and Cross Margin",
  },
  {
    icon: Wallet,
    title: "Withdraw to Crypto Wallet",
    description: "Withdraw crypto directly into your crypto wallet",
  },
  {
    icon: BarChart3,
    title: "Strategy Builder",
    description: "Create and analyse your own trades and strategies",
  },
  {
    icon: Package,
    title: "Basket Orders",
    description: "With Basket Orders place multiple orders at the same time",
  },
  {
    icon: TrendingUp,
    title: "PNL Analytics",
    description: "Easily analyze your daily gains and losses with best in class PNL Analytics",
  },
  {
    icon: Target,
    title: "Deep OTM/ITM Options",
    description: "Trade deep OTM/ITM options strikes with daily and weekly expiry",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-16 md:py-24 bg-secondary">
      <div className="container">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-center">
          Best in Class Features to Trade Options
        </h2>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          Everything you need for professional crypto derivatives trading
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
