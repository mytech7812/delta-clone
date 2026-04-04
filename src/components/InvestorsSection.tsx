const investors = ["Aave", "Kyber", "Sino Global", "Spartan", "Lunex", "CoinFund", "QSN", "G1", "Gumi", "BR Capital"];
const press = ["Forbes", "CoinTelegraph", "CoinDesk", "Nasdaq", "WSJ"];

const LogoTicker = ({ items, reverse = false }: { items: string[]; reverse?: boolean }) => (
  <div className="overflow-hidden relative">
    <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10" />
    <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10" />
    <div className={`flex gap-12 ${reverse ? "ticker-scroll-reverse" : "ticker-scroll"}`} style={{ width: "max-content" }}>
      {[...items, ...items, ...items].map((name, i) => (
        <div
          key={i}
          className="flex items-center justify-center px-6 py-3 rounded-lg bg-secondary text-muted-foreground font-semibold text-sm whitespace-nowrap"
        >
          {name}
        </div>
      ))}
    </div>
  </div>
);

const InvestorsSection = () => {
  return (
    <section className="py-16 md:py-24 space-y-16">
      <div>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 text-center">
          Backed by Best Crypto Investors
        </h2>
        <LogoTicker items={investors} />
      </div>
      <div>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 text-center">
          In the Press
        </h2>
        <LogoTicker items={press} reverse />
      </div>
    </section>
  );
};

export default InvestorsSection;
