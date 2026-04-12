// Full cryptocurrency list
// Full cryptocurrency list (keep all for "All Cryptos" modal)
export const CRYPTOS = [
  { sym: "BTC", name: "Bitcoin", color: "#F7931A", icon: "₿" },
  { sym: "ETH", name: "Ethereum", color: "#627EEA", icon: "Ξ" },
  { sym: "SOL", name: "Solana", color: "#9945FF", icon: "◎" },
  { sym: "USDT", name: "Tether", color: "#26A17B", icon: "₮" },
  // Keep other cryptos for "All Cryptos" modal but they won't show in main grid
  { sym: "BNB", name: "BNB", color: "#F3BA2F", icon: "B" },
  { sym: "XRP", name: "XRP", color: "#00AAE4", icon: "✕" },
  { sym: "ADA", name: "Cardano", color: "#6366F1", icon: "₳" },
  { sym: "DOT", name: "Polkadot", color: "#E6007A", icon: "●" },
  { sym: "AVAX", name: "Avalanche", color: "#E84142", icon: "△" },
  { sym: "MATIC", name: "Polygon", color: "#8247E5", icon: "M" },
  { sym: "LINK", name: "Chainlink", color: "#2A5ADA", icon: "⬡" },
  { sym: "UNI", name: "Uniswap", color: "#FF007A", icon: "U" },
  { sym: "ATOM", name: "Cosmos", color: "#6B7280", icon: "⚛" },
  { sym: "DOGE", name: "Dogecoin", color: "#C2A633", icon: "D" },
  { sym: "LTC", name: "Litecoin", color: "#A0A0A0", icon: "Ł" },
  { sym: "SHIB", name: "Shiba Inu", color: "#FF4500", icon: "Ş" },
  { sym: "FTM", name: "Fantom", color: "#1969FF", icon: "F" },
  { sym: "NEAR", name: "NEAR", color: "#00EC97", icon: "N" },
  { sym: "ALGO", name: "Algorand", color: "#818CF8", icon: "A" },
  { sym: "VET", name: "VeChain", color: "#15BDFF", icon: "V" },
  { sym: "ICP", name: "ICP", color: "#29ABE2", icon: "∞" },
];

// User holdings (will be fetched from Supabase)
export const MAJOR = ["BTC", "ETH", "SOL", "USDT"];

// Navigation items
export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
  { id: 'markets', label: 'Markets', icon: '↗' },
  { id: 'history', label: 'History', icon: '◷' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
  { id: 'asset-recovery', label: 'Asset Recovery', icon: '🔒' },  // ADD THIS

];