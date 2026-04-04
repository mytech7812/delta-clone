import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";

const categories = ["BTC Options", "ETH Options", "Futures"] as const;
type Category = typeof categories[number];

const marketData: Record<Category, Array<{
  symbol: string;
  asset: string;
  expiry: string;
  lastPrice: string;
  change: number;
  volume: string;
}>> = {
  "BTC Options": [
    { symbol: "C-BTC-68200", asset: "BTC", expiry: "05 Apr", lastPrice: "35 USDT", change: 20.69, volume: "$244.10K" },
    { symbol: "C-BTC-68400", asset: "BTC", expiry: "05 Apr", lastPrice: "16 USDT", change: 0, volume: "$202.03K" },
    { symbol: "P-BTC-66000", asset: "BTC", expiry: "05 Apr", lastPrice: "25 USDT", change: 0, volume: "$201.98K" },
    { symbol: "P-BTC-65800", asset: "BTC", expiry: "05 Apr", lastPrice: "12 USDT", change: -25, volume: "$168.32K" },
    { symbol: "P-BTC-65800", asset: "BTC", expiry: "06 Apr", lastPrice: "126 USDT", change: 0, volume: "$67.22K" },
    { symbol: "P-BTC-66600", asset: "BTC", expiry: "05 Apr", lastPrice: "128.5 USDT", change: 0.23, volume: "$63.73K" },
  ],
  "ETH Options": [
    { symbol: "C-ETH-3800", asset: "ETH", expiry: "05 Apr", lastPrice: "12 USDT", change: 15.2, volume: "$180.50K" },
    { symbol: "P-ETH-3600", asset: "ETH", expiry: "05 Apr", lastPrice: "8 USDT", change: -10.5, volume: "$145.20K" },
    { symbol: "C-ETH-3900", asset: "ETH", expiry: "06 Apr", lastPrice: "22 USDT", change: 5.1, volume: "$120.00K" },
    { symbol: "P-ETH-3500", asset: "ETH", expiry: "05 Apr", lastPrice: "15 USDT", change: -3.8, volume: "$98.50K" },
    { symbol: "C-ETH-4000", asset: "ETH", expiry: "07 Apr", lastPrice: "6 USDT", change: 0, volume: "$75.10K" },
    { symbol: "P-ETH-3400", asset: "ETH", expiry: "05 Apr", lastPrice: "4.5 USDT", change: -18.2, volume: "$52.30K" },
  ],
  "Futures": [
    { symbol: "BTCUSDT", asset: "BTC", expiry: "Perpetual", lastPrice: "67,245 USDT", change: 2.34, volume: "$1.2B" },
    { symbol: "ETHUSDT", asset: "ETH", expiry: "Perpetual", lastPrice: "3,742 USDT", change: 1.87, volume: "$890M" },
    { symbol: "SOLUSDT", asset: "SOL", expiry: "Perpetual", lastPrice: "185.20 USDT", change: -3.12, volume: "$320M" },
    { symbol: "BNBUSDT", asset: "BNB", expiry: "Perpetual", lastPrice: "612.50 USDT", change: 0.95, volume: "$210M" },
    { symbol: "XRPUSDT", asset: "XRP", expiry: "Perpetual", lastPrice: "0.6234 USDT", change: -1.45, volume: "$180M" },
    { symbol: "DOGEUSDT", asset: "DOGE", expiry: "Perpetual", lastPrice: "0.1825 USDT", change: 4.67, volume: "$150M" },
  ],
};

const tabs = ["Highest Volume", "Top Gainers", "Top Losers"] as const;

const MarketsSection = () => {
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>("Highest Volume");
  const [activeCategory, setActiveCategory] = useState<Category>("BTC Options");

  const data = marketData[activeCategory];

  return (
    <section id="markets" className="py-16 md:py-24">
      <div className="container">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">Markets</h2>

        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                activeCategory === cat
                  ? "border-primary text-primary bg-accent"
                  : "border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Contracts</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Last Price</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">24h Change</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">24h Volume</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="border-t border-border hover:bg-secondary/50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-accent-foreground">
                        {row.asset.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{row.symbol}</div>
                        <div className="text-xs text-muted-foreground">{row.expiry}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-right px-4 py-4 font-medium text-foreground">{row.lastPrice}</td>
                  <td className="text-right px-4 py-4">
                    <span className={`inline-flex items-center gap-1 font-medium ${
                      row.change > 0 ? "text-success" : row.change < 0 ? "text-destructive" : "text-muted-foreground"
                    }`}>
                      {row.change > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : row.change < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : null}
                      {row.change > 0 ? "+" : ""}{row.change}%
                    </span>
                  </td>
                  <td className="text-right px-4 py-4 text-foreground">{row.volume}</td>
                  <td className="text-right px-4 py-4">
                    <Button variant="outline" size="sm" className="text-xs font-semibold gap-1">
                      Trade <ArrowUpRight className="w-3 h-3" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 text-center">
          <Button variant="outline" className="font-semibold">
            View All Markets
          </Button>
        </div>
      </div>
    </section>
  );
};

export default MarketsSection;
