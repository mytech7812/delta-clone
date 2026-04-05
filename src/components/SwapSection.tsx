import { ArrowLeftRight, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const SwapSection = () => {
  return (
    <section id="swap" className="py-16 md:py-24">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-sm font-medium">
              <ArrowLeftRight className="w-4 h-4" />
              Instant Swaps
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
              Swap Crypto<br />Instantly
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
              Exchange one crypto for another in seconds. No order books, no waiting. Get the best rates across multiple networks with zero hassle.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-foreground text-sm">Lightning Fast</div>
                  <div className="text-xs text-muted-foreground">Swaps in seconds</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-foreground text-sm">Non-Custodial</div>
                  <div className="text-xs text-muted-foreground">Your keys, your crypto</div>
                </div>
              </div>
            </div>
            <Button size="lg" className="rounded-full font-semibold px-8">
              Start Swapping
            </Button>
          </div>

          {/* Swap visual */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-sm">
              <div className="absolute inset-0 bg-primary/10 rounded-3xl blur-2xl scale-90" />
              <div className="relative bg-card border border-border rounded-2xl p-6 space-y-4">
                <div className="text-sm font-medium text-muted-foreground">You Send</div>
                <div className="flex items-center justify-between bg-secondary rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[hsl(39,100%,50%)] flex items-center justify-center text-white font-bold text-sm">₿</div>
                    <div>
                      <div className="font-semibold text-foreground">BTC</div>
                      <div className="text-xs text-muted-foreground">Bitcoin</div>
                    </div>
                  </div>
                  <div className="text-xl font-bold text-foreground">0.5</div>
                </div>
                <div className="flex justify-center">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    <ArrowLeftRight className="w-5 h-5 text-primary-foreground" />
                  </div>
                </div>
                <div className="text-sm font-medium text-muted-foreground">You Receive</div>
                <div className="flex items-center justify-between bg-secondary rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[hsl(220,60%,55%)] flex items-center justify-center text-white font-bold text-sm">Ξ</div>
                    <div>
                      <div className="font-semibold text-foreground">ETH</div>
                      <div className="text-xs text-muted-foreground">Ethereum</div>
                    </div>
                  </div>
                  <div className="text-xl font-bold text-foreground">8.42</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SwapSection;
