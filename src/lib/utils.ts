import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// ===== EXISTING SHADCN/UI FUNCTION =====
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ===== DASHBOARD UTILITIES =====
import { CRYPTOS } from './constants';

// Get crypto info by symbol
export const getCrypto = (sym: string) => {
  return CRYPTOS.find(c => c.sym === sym) || CRYPTOS[0];
};

// Format USD values
export const formatUSD = (n: number): string => {
  if (n === 0) return '$0';
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${n.toLocaleString('en', { maximumFractionDigits: 2 })}`;
  return `$${n.toFixed(2)}`;
};

// Format crypto amounts
export const formatCrypto = (n: number): string => {
  if (n === 0) return '0';
  if (n >= 10000) return n.toLocaleString('en', { maximumFractionDigits: 0 });
  if (n >= 1) return n.toFixed(2);
  if (n >= 0.001) return n.toFixed(4);
  return n.toFixed(8);
};

// Calculate total portfolio USD value
export const calculateTotalUSD = (holdings: Record<string, number>, prices: Record<string, number>): number => {
  return Object.entries(holdings).reduce((sum, [sym, amount]) => {
    return sum + amount * (prices[sym] || 0);
  }, 0);
};

// Get sorted holdings array
export const getSortedHoldings = (holdings: Record<string, number>, prices: Record<string, number>) => {
  return Object.entries(holdings)
    .map(([sym, amount]) => ({
      sym,
      amount,
      usd: amount * (prices[sym] || 0),
      crypto: getCrypto(sym)
    }))
    .filter(item => item.usd > 0)
    .sort((a, b) => b.usd - a.usd);
};