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
    
    if (!data?.wallet_address) {
      throw new Error('No wallet address configured');
    }

    walletCache[cryptoSymbol] = data.wallet_address;
    cacheTimestamp = Date.now();
    return walletCache[cryptoSymbol];
  } catch (error) {
    console.error('Error fetching wallet address:', error);
    // NO HARDCODED FALLBACK - Show error message instead
    return '⚠️ CONTACT SUPPORT - ADDRESS NOT CONFIGURED';
  }
};

// Invalidate cache (call this after admin updates a wallet)
export const invalidateWalletCache = () => {
  walletCache = {};
  cacheTimestamp = 0;
};