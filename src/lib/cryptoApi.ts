import axios from 'axios';

// Map our symbols to CoinGecko IDs
const symbolToGeckoId: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  USDT: 'tether',
  BNB: 'binancecoin',
  XRP: 'ripple',
  ADA: 'cardano',
  DOT: 'polkadot',
  AVAX: 'avalanche-2',
  MATIC: 'matic-network',
  LINK: 'chainlink',
  UNI: 'uniswap',
  ATOM: 'cosmos',
  DOGE: 'dogecoin',
  LTC: 'litecoin',
  SHIB: 'shiba-inu',
  FTM: 'fantom',
  NEAR: 'near',
  ALGO: 'algorand',
  VET: 'vechain',
  ICP: 'internet-computer',
};

interface PriceData {
  prices: Record<string, number>;
  changes: Record<string, number>;
}

// Fetch real-time prices and 24h changes from CoinGecko
export async function fetchRealTimeData(): Promise<PriceData> {
  const ids = Object.values(symbolToGeckoId).join(',');
  const response = await axios.get(
    `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
    { timeout: 10000 }
  );
  
  const prices: Record<string, number> = {};
  const changes: Record<string, number> = {};
  
  for (const [sym, id] of Object.entries(symbolToGeckoId)) {
    if (response.data[id]) {
      prices[sym] = response.data[id].usd;
      changes[sym] = response.data[id].usd_24h_change || 0;
    }
  }
  
  return { prices, changes };
}