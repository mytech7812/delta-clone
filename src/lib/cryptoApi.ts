import axios from 'axios';

const symbolToGeckoId: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
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
  USDT: 'tether',
  USDC: 'usd-coin',
};

interface PriceData {
  prices: Record<string, number>;
  changes: Record<string, number>;
}

export async function fetchRealTimeData(): Promise<PriceData> {
  try {
    const ids = Object.values(symbolToGeckoId).join(',');
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
      { timeout: 15000 }
    );
    
    const prices: Record<string, number> = {};
    const changes: Record<string, number> = {};
    
    for (const [sym, id] of Object.entries(symbolToGeckoId)) {
      if (response.data[id]) {
        prices[sym] = response.data[id].usd;
        changes[sym] = response.data[id].usd_24h_change || 0;
      }
    }
    
    // Return empty object if no data fetched
    if (Object.keys(prices).length === 0) {
      throw new Error('No price data received');
    }
    
    return { prices, changes };
  } catch (error) {
    console.error('Failed to fetch from CoinGecko:', error);
    // Return empty data - caller will use cached data
    return { prices: {}, changes: {} };
  }
}