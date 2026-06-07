import { supabase } from './supabase';

// Cache for wallet addresses
let walletCache: Record<string, string> = {};
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fetch wallet address from Supabase
export const getAdminWallet = async (cryptoSymbol: string): Promise<string> => {
  // Check cache
  if (walletCache[cryptoSymbol] && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return walletCache[cryptoSymbol];
  }

  try {
    const { data, error } = await supabase
      .from('admin_wallets')
      .select('wallet_address')
      .eq('crypto_symbol', cryptoSymbol)
      .single();

    if (error) throw error;

    walletCache[cryptoSymbol] = data?.wallet_address || 'Wallet not configured';
    cacheTimestamp = Date.now();
    return walletCache[cryptoSymbol];
  } catch (error) {
    console.error('Error fetching wallet address:', error);
    // Fallback to hardcoded values only if DB fails
    const fallbackWallets: Record<string, string> = {
      BTC: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      ETH: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
      SOL: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
    };
    return fallbackWallets[cryptoSymbol] || 'Contact support';
  }
};

// Invalidate cache (call this after admin updates a wallet)
export const invalidateWalletCache = () => {
  walletCache = {};
  cacheTimestamp = 0;
};