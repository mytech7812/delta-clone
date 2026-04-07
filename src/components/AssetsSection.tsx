import { motion } from "framer-motion";
import { getCryptoIcon } from '@/lib/cryptoIcons';

const cryptoIcons = [
  { symbol: "BTC", x: "10%", y: "20%" },
  { symbol: "ETH", x: "75%", y: "10%" },
  { symbol: "SOL", x: "85%", y: "55%" },
  { symbol: "BNB", x: "5%", y: "65%" },
  { symbol: "XRP", x: "55%", y: "75%" },
  { symbol: "ADA", x: "30%", y: "5%" },
  { symbol: "DOT", x: "90%", y: "30%" },
  { symbol: "AVAX", x: "20%", y: "80%" },
  { symbol: "MATIC", x: "65%", y: "45%" },
  { symbol: "LINK", x: "40%", y: "60%" },
  { symbol: "UNI", x: "50%", y: "15%" },
  { symbol: "ATOM", x: "15%", y: "45%" },
  { symbol: "DOGE", x: "70%", y: "70%" },
  { symbol: "LTC", x: "35%", y: "85%" },
  { symbol: "SHIB", x: "80%", y: "80%" },
];

const AssetsSection = () => {
  return (
    <section id="assets" className="py-16 md:py-24 overflow-hidden">
      <div className="container text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-2">
          1,000,000+
        </h2>
        <p className="text-xl md:text-2xl text-muted-foreground mb-4">
          Assets Supported
        </p>
        <p className="text-muted-foreground max-w-xl mx-auto mb-12">
          From Bitcoin to the newest tokens — access the widest range of crypto assets across all major blockchains.
        </p>

        {/* Floating crypto icons */}
        <div className="relative h-[300px] md:h-[400px] max-w-3xl mx-auto">
          {cryptoIcons.map((icon, i) => (
            <motion.div
              key={icon.symbol}
              className="absolute"
              style={{ left: icon.x, top: icon.y }}
              animate={{
                y: [0, -12, 0, 8, 0],
                x: [0, 5, 0, -5, 0],
              }}
              transition={{
                duration: 4 + (i % 3),
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.3,
              }}
            >
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-lg bg-white/10 backdrop-blur-sm p-1">
                {getCryptoIcon(icon.symbol, 36)}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AssetsSection;