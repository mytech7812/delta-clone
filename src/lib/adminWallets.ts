// Admin wallet addresses for each cryptocurrency
// These will be set by admin and stored in Supabase later
export const ADMIN_WALLETS: Record<string, string> = {
  BTC: 'bc1q59svrkd47hw6hdwr6n0ng7xhwetwv8m5fu6u8y',
  ETH: '0xd744Ba7056C1B9242265A7cAFEB7051dBB256101',
  SOL: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
  BNB: 'bnb1grpf0955v0j7tvz0p8my2rq0q0q0q0q0q0q0q0',
  USDT: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
  USDC: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
};

// Get admin wallet for a specific crypto
export const getAdminWallet = (cryptoSymbol: string): string => {
  return ADMIN_WALLETS[cryptoSymbol] || 'Wallet address not configured';
};