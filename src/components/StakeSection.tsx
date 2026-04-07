import { getCryptoIcon } from '@/lib/cryptoIcons';

const stakeOptions = [
  { sym: 'SOL', name: 'Solana', apy: 7.2 },
  { sym: 'ETH', name: 'Ethereum', apy: 4.8 },
  { sym: 'ATOM', name: 'Cosmos', apy: 12.5 },
  { sym: 'DOT', name: 'Polkadot', apy: 11.3 },
];

export default function StakeSection() {
  return (
    <section className="py-16 bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Earn Passive Income
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Stake your crypto and earn rewards. No lockup minimums, withdraw anytime. 
            Your assets work for you 24/7.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stakeOptions.map((stake) => (
            <div
              key={stake.sym}
              className="bg-background border border-border rounded-xl p-6 text-center hover:border-primary/50 transition-all hover:shadow-lg"
            >
              <div className="flex justify-center mb-4">
                {getCryptoIcon(stake.sym, 48)}
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-1">
                {stake.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">{stake.sym}</p>
              <div className="text-2xl font-bold text-primary">{stake.apy}%</div>
              <p className="text-xs text-muted-foreground mt-1">APY</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}