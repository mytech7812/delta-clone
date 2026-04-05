import { motion } from "framer-motion";

const cryptoIcons = [
  { symbol: "BTC", color: "hsl(39, 100%, 50%)", x: "10%", y: "20%" },
  { symbol: "ETH", color: "hsl(220, 60%, 55%)", x: "75%", y: "10%" },
  { symbol: "SOL", color: "hsl(260, 80%, 60%)", x: "85%", y: "55%" },
  { symbol: "BNB", color: "hsl(45, 100%, 45%)", x: "5%", y: "65%" },
  { symbol: "XRP", color: "hsl(0, 0%, 30%)", x: "55%", y: "75%" },
  { symbol: "ADA", color: "hsl(210, 70%, 50%)", x: "30%", y: "5%" },
  { symbol: "DOT", color: "hsl(330, 70%, 55%)", x: "90%", y: "30%" },
  { symbol: "AVAX", color: "hsl(0, 70%, 50%)", x: "20%", y: "80%" },
  { symbol: "MATIC", color: "hsl(260, 60%, 50%)", x: "65%", y: "45%" },
  { symbol: "LINK", color: "hsl(220, 80%, 55%)", x: "40%", y: "60%" },
  { symbol: "UNI", color: "hsl(330, 60%, 55%)", x: "50%", y: "15%" },
  { symbol: "ATOM", color: "hsl(200, 70%, 50%)", x: "15%", y: "45%" },
  { symbol: "DOGE", color: "hsl(39, 80%, 55%)", x: "70%", y: "70%" },
  { symbol: "LTC", color: "hsl(0, 0%, 55%)", x: "35%", y: "85%" },
  { symbol: "SHIB", color: "hsl(15, 90%, 55%)", x: "80%", y: "80%" },
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
              <div
                className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm shadow-lg"
                style={{
                  backgroundColor: icon.color,
                  boxShadow: `0 4px 20px ${icon.color}40`,
                }}
              >
                {icon.symbol}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AssetsSection;
