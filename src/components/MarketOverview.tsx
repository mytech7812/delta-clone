import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatUSD } from '@/lib/utils';
import { fetchRealTimeData } from '@/lib/cryptoApi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MarketStats {
  availableBalance: number;
  totalInvested: number;
  totalGrowth: number;
  totalTransactions: number;
}

const chartData = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 5000 },
  { name: 'Apr', value: 4500 },
  { name: 'May', value: 6000 },
  { name: 'Jun', value: 5500 },
  { name: 'Jul', value: 7000 },
];

// Fallback prices in case API fails
const FALLBACK_PRICES: Record<string, number> = {
  BTC: 67245,
  ETH: 3742,
  SOL: 185,
  USDT: 1,
  USDC: 1,
  BNB: 612,
  XRP: 0.62,
  ADA: 0.48,
  DOGE: 0.18,
  MATIC: 0.88,
  DOT: 8.34,
  AVAX: 38.92,
  LINK: 14.23,
  UNI: 8.45,
  ATOM: 9.21,
  LTC: 84.32,
  SHIB: 0.00002345,
  FTM: 0.78,
  NEAR: 6.43,
  ALGO: 0.21,
  VET: 0.042,
  ICP: 12.45,
};

export function MarketOverview() {
  const [stats, setStats] = useState<MarketStats>({
    availableBalance: 0,
    totalInvested: 0,
    totalGrowth: 0,
    totalTransactions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarketStats = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get real-time prices (with fallback)
        let prices = FALLBACK_PRICES;
        try {
          const realTimeData = await fetchRealTimeData();
          if (realTimeData && realTimeData.prices) {
            prices = { ...FALLBACK_PRICES, ...realTimeData.prices };
          }
        } catch (error) {
          console.log('Using fallback prices due to API error');
        }

        console.log('Prices being used:', prices);

        // Get user balances from database
        const { data: balances, error: balancesError } = await supabase
          .from('user_balances')
          .select('crypto_symbol, balance')
          .eq('user_id', user.id);

        if (balancesError) {
          console.error('Balances error:', balancesError);
        }

        console.log('User balances:', balances);

        // Calculate available balance in USD
        let availableBalance = 0;
        balances?.forEach((item: any) => {
          const cryptoPrice = prices[item.crypto_symbol] || 0;
          const cryptoAmount = Number(item.balance) || 0;
          const usdValue = cryptoAmount * cryptoPrice;
          availableBalance += usdValue;
          console.log(`${item.crypto_symbol}: ${cryptoAmount} × $${cryptoPrice} = $${usdValue.toFixed(2)}`);
        });

        console.log('Total available balance:', availableBalance);

        // Get successful deposits (approved deposits in USD)
        const { data: deposits, error: depositsError } = await supabase
          .from('transactions')
          .select('usd_amount')
          .eq('user_id', user.id)
          .eq('type', 'deposit')
          .eq('status', 'approved');

        if (depositsError) {
          console.error('Deposits error:', depositsError);
        }

        const totalInvested = deposits?.reduce((sum, d) => sum + (d.usd_amount || 0), 0) || 0;

        // Get total approved transactions count
        const { count: totalTransactions, error: countError } = await supabase
          .from('transactions')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'approved');

        if (countError) {
          console.error('Count error:', countError);
        }

        // Calculate growth percentage
        const totalGrowth = totalInvested > 0
          ? ((availableBalance - totalInvested) / totalInvested) * 100
          : 0;

        console.log('Final stats:', { availableBalance, totalInvested, totalGrowth, totalTransactions });

        setStats({
          availableBalance,
          totalInvested,
          totalGrowth,
          totalTransactions: totalTransactions || 0,
        });
      } catch (error) {
        console.error('Error fetching market stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketStats();
  }, []);

if (loading) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-primary via-blue-400 to-cyan-400 animate-pulse flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-xl">A</span>
        </div>
        <p className="text-xs text-muted-foreground">Loading market data...</p>
      </div>
    </div>
  );
}
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-background border border-border rounded-xl p-4">
          <div className="text-sm text-muted-foreground mb-1">Available Balance</div>
          <div className="text-2xl font-bold text-foreground">{formatUSD(stats.availableBalance)}</div>
        </div>
        <div className="bg-background border border-border rounded-xl p-4">
          <div className="text-sm text-muted-foreground mb-1">Total Invested</div>
          <div className="text-2xl font-bold text-foreground">{formatUSD(stats.totalInvested)}</div>
        </div>
        <div className="bg-background border border-border rounded-xl p-4">
          <div className="text-sm text-muted-foreground mb-1">Total Growth</div>
          <div className={`text-2xl font-bold ${stats.totalGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {stats.totalGrowth >= 0 ? '+' : ''}{stats.totalGrowth.toFixed(2)}%
          </div>
        </div>
        <div className="bg-background border border-border rounded-xl p-4">
          <div className="text-sm text-muted-foreground mb-1">Total Transactions</div>
          <div className="text-2xl font-bold text-foreground">{stats.totalTransactions}</div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-background border border-border rounded-xl p-4">
        <h3 className="text-sm font-medium text-foreground mb-4">Portfolio Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0099ff" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#0099ff" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-tertiary)" />
            <XAxis dataKey="name" stroke="var(--color-text-secondary)" />
            <YAxis stroke="var(--color-text-secondary)" />
            <Tooltip 
              contentStyle={{ 
                background: 'var(--color-background-primary)', 
                border: '1px solid var(--color-border-tertiary)',
                borderRadius: 8,
                color: 'var(--color-text-primary)'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#0099ff" 
              fillOpacity={1} 
              fill="url(#colorValue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}