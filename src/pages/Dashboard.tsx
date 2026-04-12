import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { NAV_ITEMS } from '@/lib/constants';
import { fetchRealTimeData } from '@/lib/cryptoApi';
import { calculateTotalUSD, formatUSD, formatCrypto, getSortedHoldings } from '@/lib/utils';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { DonutChart } from '@/components/dashboard/DonutChart';
import { CryptoCard } from '@/components/dashboard/CryptoCard';
import { TransactionRow } from '@/components/dashboard/TransactionRow';
import { CIcon } from '@/components/CIcon';
import { CryptoModal } from '@/components/modals/CryptoModal';
import { AllCryptosModal } from '@/components/modals/AllCryptosModal';
import { SwapModal } from '@/components/modals/SwapModal';
import { DepositModal } from '@/components/modals/DepositModal';
import { TransactionDetailModal } from '@/components/modals/TransactionDetailModal';
import { WithdrawModal } from '@/components/modals/WithdrawModal';
import { DepositConfirmationModal } from '@/components/modals/DepositConfirmationModal';
import { ReceiveModal } from '@/components/modals/ReceiveModal';
import { MarketOverview } from '@/components/MarketOverview';
import { History } from '@/components/History';
import { Settings } from '@/components/Settings';
import { MobileSidebar } from '@/components/dashboard/MobileSidebar';
import { AssetRecovery } from '@/components/AssetRecovery';
import { TokenBTC, TokenETH, TokenSOL, TokenBNB, TokenXRP, TokenUSDC, TokenADA, TokenUSDT } from '@web3icons/react';import '@/styles/dashboard.css';

interface Transaction {
  id: number;
  type: 'deposit' | 'withdraw' | 'swap';
  sym?: string;
  amt?: number;
  usd: number;
  date: string;
  from?: string;
  to?: string;
  status?: 'pending' | 'completed';
  txHash?: string;
}

type ModalType = 
  | { type: 'crypto'; sym: string }
  | { type: 'all' }
  | { type: 'swap'; sym?: string }
  | { type: 'deposit' }
  | { type: 'withdraw'; sym?: string | null }
  | { type: 'receive'; sym: string }
  | { type: 'portfolioMobile' }
  | null;

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('dashboard');
const [prices, setPrices] = useState<Record<string, number>>({});
const [priceChanges, setPriceChanges] = useState<Record<string, number>>({});
  const [pricesAreStale, setPricesAreStale] = useState(false);
  const [holdings, setHoldings] = useState<Record<string, number>>({});
  const [holdingsLoading, setHoldingsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalType>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [lastDeposit, setLastDeposit] = useState<any>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  

  const handleTransactionClick = (tx: any) => {
    setSelectedTransaction(tx);
  };

  // REFRESH BALANCES FUNCTION - MOVED OUTSIDE handleDepositSubmit
    

// Fetch user's transactions from DB so they persist after reload
const fetchUserTransactions = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data: txs, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      if (error.name !== 'AbortError') {
        console.error('Failed to fetch user transactions:', error);
      }
      return;
    }

    const mapped = (txs || []).map((t: any) => ({
      id: t.id,
      type: t.type,
      sym: t.crypto_symbol || t.sym,
      amt: t.amount || t.amt || null,
      usd: t.usd_amount || t.usd || 0,
      date: new Date(t.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      time: t.created_at ? new Date(t.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : undefined,
      status: t.status || 'pending',
      txHash: t.tx_hash || t.txHash || undefined,
      adminNotes: t.admin_notes,  // ADD THIS LINE

    }));

    setTransactions(mapped);
  } catch (err: any) {
    if (err?.name !== 'AbortError') {
      console.error('Error fetching transactions:', err);
    }
  }
};

  const handleDepositSubmit = async (deposit: {
    cryptoSymbol: string;
    amount: number;
    usdAmount: number;
    adminWallet: string;
  }) => {
    // Simulate 5 second delay
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Get current date and time
    const now = new Date();
    const date = now.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
    const time = now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    
    // Create a new pending transaction
    const newTransaction = {
      id: Date.now(),
      type: 'deposit',
      sym: deposit.cryptoSymbol,
      amt: deposit.amount,
      usd: deposit.usdAmount,
      date: date,
      time: time,
      status: 'pending',
      adminWallet: deposit.adminWallet,
      adminNotes: null,
    };
    
    // Add to transactions list
    setTransactions([newTransaction, ...transactions]);
    // Persist transaction to DB so it remains after refresh
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: inserted, error } = await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            type: 'deposit',
            crypto_symbol: deposit.cryptoSymbol,
            amount: deposit.amount,
            usd_amount: deposit.usdAmount,
            status: 'pending',
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) {
          console.error('Failed to persist transaction:', error);
        } else if (inserted) {
          // Replace the temporary transaction id with the DB id in UI
          setTransactions(prev => prev.map(tx => tx.id === newTransaction.id ? {
            ...tx,
            id: inserted.id,
            // ensure fields match what DB returned
            date: new Date(inserted.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
            time: new Date(inserted.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
          } : tx));
          // Also refresh persisted transactions list to ensure canonical state
          await fetchUserTransactions();
        }
      }
    } catch (err) {
      console.error('Error saving transaction to DB:', err);
    }
    
    // Store last deposit for confirmation modal
    setLastDeposit({
      cryptoSymbol: deposit.cryptoSymbol,
      amount: deposit.amount,
      usdAmount: deposit.usdAmount,
      adminWallet: deposit.adminWallet,
      date: date,
      time: time,
    });
    
    // Show confirmation modal
    setShowConfirmation(true);
    
    // Refresh balances after deposit
    await refreshBalances();
    
    console.log('Deposit submitted:', deposit);
  };

// Helper to refresh balances (used by realtime listeners)
const refreshBalances = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: balances, error } = await supabase
      .from('user_balances')
      .select('crypto_symbol, balance')
      .eq('user_id', user.id);

    if (error) throw error;

    const userHoldings: Record<string, number> = {};
    balances?.forEach((item: any) => {
      if (item && item.crypto_symbol) {
        const sym = String(item.crypto_symbol).toUpperCase();
        userHoldings[sym] = Number(item.balance) || 0;
      }
    });

    setHoldings(userHoldings);
  } catch (error: any) {
    // Ignore lock errors - they're harmless and will retry
    if (error?.name !== 'AbortError' && !error?.message?.includes('Lock')) {
      console.error('Error fetching balances:', error);
    }
  } finally {
    setHoldingsLoading(false);
  }
};

// Check authentication with session persistence
useEffect(() => {
  let mounted = true;

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!mounted) return;
    
    if (!session) {
      // No session, stay on login page
      setLoading(false);
    } else {
      setUserEmail(session.user.email || null);
      setUser(session.user);
      setLoading(false);
    }
  };

  checkSession();

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    if (!mounted) return;
    
    if (!session) {
      // User manually signed out
      navigate('/');
      setUser(null);
      setUserEmail(null);
    } else {
      setUserEmail(session.user.email || null);
      setUser(session.user);
    }
  });

  return () => {
    mounted = false;
    subscription.unsubscribe();
  };
}, [navigate]);

  // Load transactions for the signed-in user
  useEffect(() => {
    fetchUserTransactions();
    // Also refresh when auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) fetchUserTransactions();
    });
    return () => subscription.unsubscribe();
  }, []);

// Subscribe to realtime changes so user's dashboard updates when admin approves deposits
useEffect(() => {
  let balancesSub: any = null;
  let txSub: any = null;
  let mounted = true;

  const setupRealtime = async () => {
    try {
      // Add a small delay to avoid lock conflicts
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user || !mounted) return;

      // Listen for changes to this user's balances
      balancesSub = (supabase as any)
        .channel(`balances-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_balances',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            if (mounted) refreshBalances();
          }
        )
        .subscribe();

      // Listen for changes to this user's transactions
      txSub = (supabase as any)
        .channel(`transactions-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'transactions',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            if (mounted) fetchUserTransactions();
          }
        )
        .subscribe();
    } catch (err) {
      console.error('Failed to setup realtime subscriptions', err);
    }
  };

  setupRealtime();

  return () => {
    mounted = false;
    try {
      if (balancesSub && typeof balancesSub.unsubscribe === 'function') balancesSub.unsubscribe();
      if (txSub && typeof txSub.unsubscribe === 'function') txSub.unsubscribe();
    } catch (err) {
      // best-effort unsubscribe
    }
  };
}, []);

  // Fetch user's real balances from Supabase
  useEffect(() => {
    // load once on mount
    refreshBalances();
  }, []);

// Fetch real-time prices and 24h changes
// Fetch real-time prices and 24h changes
useEffect(() => {
  const loadRealTimeData = async () => {
    try {
      const { prices: realPrices, changes: realChanges } = await fetchRealTimeData();
      
      if (realPrices && Object.keys(realPrices).length > 0) {
        setPrices(realPrices);
        setPriceChanges(realChanges);
        // Cache successfully fetched prices
        const payload = { prices: realPrices, changes: realChanges, ts: Date.now() };
        localStorage.setItem('anexmint:prices', JSON.stringify(payload));
        setPricesAreStale(false);
      } else {
        // API returned empty data, use cached data
        console.warn('API returned empty data, using cached prices');
        setPricesAreStale(true);
        // Keep existing prices (don't set to zero)
      }
    } catch (error) {
      console.error('Failed to fetch real-time data:', error);
      // Don't show error to user - just mark as stale
      setPricesAreStale(true);
      // Keep existing prices, don't reset to zero
    }
  };
  
  // Load cached prices first so UI doesn't show zeros while fetching
  try {
    const raw = localStorage.getItem('anexmint:prices');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.prices && Object.keys(parsed.prices).length > 0) {
        setPrices(parsed.prices);
        setPriceChanges(parsed.changes || {});
        const age = Date.now() - Number(parsed.ts || 0);
        setPricesAreStale(age > 10 * 60 * 1000);
      }
    }
  } catch (e) { /* ignore parse/storage errors */ }

  loadRealTimeData();
  const interval = setInterval(loadRealTimeData, 30000);

  return () => clearInterval(interval);
}, []);

// Calculate portfolio 24h change based on actual holdings and real price changes
// Calculate portfolio change based on actual holdings and real price changes (same as MarketOverview)
const calculatePortfolioChange = () => {
  if (Object.keys(holdings).length === 0) return 0;
  if (Object.keys(prices).length === 0) return 0;
  
  let totalCurrentValue = 0;
  let totalPreviousValue = 0;
  
  for (const [sym, amount] of Object.entries(holdings)) {
    if (amount === 0) continue;
    
    const currentPrice = prices[sym] || 0;
    const changePercent = priceChanges[sym] || 0;
    
    if (currentPrice === 0) continue;
    
    totalCurrentValue += amount * currentPrice;
    // Calculate previous price based on 24h change percentage
    const previousPrice = currentPrice / (1 + changePercent / 100);
    totalPreviousValue += amount * previousPrice;
  }
  
  if (totalPreviousValue === 0) return 0;
  const change = ((totalCurrentValue - totalPreviousValue) / totalPreviousValue) * 100;
  return isNaN(change) ? 0 : change;
};

const portfolioChange = calculatePortfolioChange();
const isPositive = portfolioChange >= 0;
const total = calculateTotalUSD(holdings, prices);
const sortedHoldings = getSortedHoldings(holdings, prices);
const majorCryptos = ["BTC", "ETH", "SOL", "USDT"];

// Market Movers - Top gainers
const gainers = Object.entries(priceChanges)
  .filter(([_, change]) => change > 0)
  .sort(([, a], [, b]) => b - a)
  .slice(0, 4)
  .map(([sym, change]) => ({ sym, change }));

const displayGainers = gainers.length > 0 ? gainers : [
  { sym: 'SOL', change: 12.4 },
  { sym: 'ETH', change: 8.2 },
  { sym: 'BTC', change: 5.7 },
  { sym: 'BNB', change: 4.3 },
];

const openModal = (newModal: ModalType) => setModal(newModal);
const closeModal = () => setModal(null);

const handleSignOut = async () => {
  await supabase.auth.signOut();
  navigate('/');
};

const getCryptoIcon = (sym: string, size: number) => {
  const iconProps = { size, variant: 'branded' as const };
  switch(sym) {
    case 'BTC': return <TokenBTC {...iconProps} />;
    case 'ETH': return <TokenETH {...iconProps} />;
    case 'SOL': return <TokenSOL {...iconProps} />;
    case 'BNB': return <TokenBNB {...iconProps} />;
    case 'XRP': return <TokenXRP {...iconProps} />;
    case 'ADA': return <TokenADA {...iconProps} />;
    case 'USDC': return <TokenUSDC {...iconProps} />;

    case 'USDT': return <TokenUSDT {...iconProps} />;  // ADD THIS LINE

    default: return <CIcon sym={sym} size={size} />;
  }
};

if (loading || holdingsLoading) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-primary via-blue-400 to-cyan-400 animate-pulse flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-2xl">A</span>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">AnexMintMining</p>
          <p className="text-xs text-muted-foreground mt-1">Loading your dashboard...</p>
        </div>
      </div>
    </div>
  );
}
  return (
    <div className="app">
      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} user={user} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
{/* Topbar - Sticky with three sections */}
<div className="topbar" style={{ 
  position: 'sticky',
  top: 0,
  zIndex: 20,
  background: 'var(--color-background-primary)',
  borderBottom: '1px solid var(--color-border-tertiary)',
  padding: '12px 16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}}>
  {/* Left: Menu Button + Welcome Message */}
  <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
    {/* Menu Button (mobile only) */}
    <div className="mobile-menu-button">
      {/* Menu button will be placed here by MobileSidebar component */}
    </div>

    {/* Welcome Message */}
    <div>
      <h2 style={{ fontSize: 15, fontWeight: 500, margin: 0, color: 'var(--color-text-primary)' }}>
        Welcome back, {(() => {
          const meta = user?.user_metadata || {};
          const firstName = meta.first_name || meta.firstName || '';
          const fullName = meta.full_name || meta.fullName || '';
          const name = firstName || (fullName ? fullName.split(' ')[0] : '');
          return name || user?.email?.split('@')[0] || 'there';
        })()}! 👋
      </h2>
      <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>
        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        {pricesAreStale && (
          <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--color-text-warning)', background: 'rgba(245,158,11,0.06)', padding: '2px 6px', borderRadius: 8 }}>
            .
          </span>
        )}
      </div>
    </div>
  </div>

  {/* Right: User Initials */}
  <div className="relative">
    <button
      onClick={() => setMenuOpen(!menuOpen)}
      style={{
        width: 40,
        height: 40,
        borderRadius: 40,
        background: 'linear-gradient(135deg, var(--brand), #00ccff)',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: '#fff',
        fontWeight: 600,
        fontSize: 14,
      }}
    >
      {(() => {
        const meta = user?.user_metadata || {};
        const firstName = meta.first_name || meta.firstName || '';
        const lastName = meta.last_name || meta.lastName || '';
        const fullName = meta.full_name || meta.fullName || '';
        
        if (firstName && lastName) {
          return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
        }
        if (fullName) {
          const parts = fullName.split(' ').filter(Boolean);
          if (parts.length >= 2) {
            return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
          }
          return fullName.slice(0, 2).toUpperCase();
        }
        return user?.email?.charAt(0).toUpperCase() || 'U';
      })()}
    </button>

    {/* Dropdown Menu */}
    {menuOpen && (
      <div className="absolute right-0 mt-2 w-56 bg-background border border-border rounded-lg shadow-lg py-2 z-50">
        <div className="px-4 py-2 border-b border-border">
          <div className="font-medium text-sm text-foreground">
            {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
          </div>
          <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
        </div>
        <button
          className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-secondary transition-colors"
          onClick={handleSignOut}
        >
          Sign Out
        </button>
      </div>
    )}


    {/* Deposit Button - Desktop only */}
    <button
      className="desktop-only"
      style={{
        background: 'var(--brand)',
        border: 'none',
        borderRadius: 8,
        padding: '8px 16px',
        cursor: 'pointer',
        color: '#fff',
        fontSize: 13,
        fontWeight: 500,
      }}
      onClick={() => openModal({ type: 'deposit' })}
    >
      + Deposit
    </button>
  </div>
</div>

        {/* Main Content */}
        <div className="main">
          {activeNav === 'dashboard' && (
            <div className="content">

              {/* Portfolio Card */}
              <div className="card">
{/* Desktop Layout - Redesigned */}
<div className="desktop-only">
  <div style={{ 
    display: 'grid', 
    gridTemplateColumns: '320px 1fr', 
    gap: '24px',
    alignItems: 'start'
  }}>
    
{/* Left Column - Pie Chart & Total Balance */}
<div style={{
  textAlign: 'center',
  marginLeft: '60px'
}}>
  <DonutChart 
    holdings={holdings} 
    prices={prices} 
    size={200} 
    change={portfolioChange}
    total={total}
  />
</div>

    {/* Right Column - Portfolio Breakdown */}
    <div style={{
      background: 'var(--color-background-primary)',
      border: '1px solid var(--color-border-tertiary)',
      borderRadius: '20px',
      padding: '20px'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px' 
      }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
          Portfolio Breakdown
        </h3>
        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
          Total: {formatUSD(total)}
        </span>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {sortedHoldings.map(({ sym, amount, usd, crypto }) => (
          <div key={sym} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              background: crypto.color, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: '#fff', 
              fontWeight: 600, 
              fontSize: '14px' 
            }}>
              {sym}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                  {crypto.name}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>
                  {formatCrypto(amount)} {sym}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                  {formatUSD(usd)}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                  {((usd / total) * 100).toFixed(1)}%
                </span>
              </div>
              <div style={{ height: '4px', background: 'var(--color-background-secondary)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${((usd / total) * 100)}%`, 
                  height: '100%', 
                  background: crypto.color, 
                  borderRadius: '2px' 
                }} />
              </div>
            </div>
          </div>
        ))}
        {sortedHoldings.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>
            No assets yet. Make your first deposit to get started.
          </div>
        )}
      </div>
    </div>
  </div>

  {/* Action Buttons Row */}
  <div style={{ 
    display: 'flex', 
    gap: '16px', 
    marginTop: '24px',
    justifyContent: 'space-between'
  }}>
    <button
      style={{
        flex: 1,
        padding: '14px 24px',
        borderRadius: '12px',
        border: 'none',
        background: 'linear-gradient(135deg, var(--brand), #00ccff)',
        color: '#fff',
        fontWeight: 600,
        fontSize: '14px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
      }}
      onClick={() => openModal({ type: 'deposit' })}
    >
      <span style={{ fontSize: '18px' }}>+</span> Add Money
    </button>
    <button
      style={{
        flex: 1,
        padding: '14px 24px',
        borderRadius: '12px',
        border: '1px solid var(--color-border-secondary)',
        background: 'var(--color-background-secondary)',
        color: 'var(--color-text-primary)',
        fontWeight: 600,
        fontSize: '14px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
      }}
      onClick={() => openModal({ type: 'withdraw' })}
    >
      <span style={{ fontSize: '18px' }}>↑</span> Withdraw
    </button>
    <button
      style={{
        flex: 1,
        padding: '14px 24px',
        borderRadius: '12px',
        border: '1px solid var(--color-border-secondary)',
        background: 'var(--color-background-secondary)',
        color: 'var(--color-text-primary)',
        fontWeight: 600,
        fontSize: '14px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
      }}
      onClick={() => openModal({ type: 'swap' })}
    >
      <span style={{ fontSize: '18px' }}>↔</span> Convert
    </button>
  </div>
</div>

                {/* Mobile Layout */}
<div className="mobile-balance mobile-only" style={{ flexDirection: 'column', alignItems: 'center', gap: 4 }}>
  <button onClick={() => setModal({ type: 'portfolioMobile' })} style={{ background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer' }} aria-label="Open portfolio breakdown">
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 9999, background: 'var(--color-background-secondary)', border: '1px solid var(--color-border-tertiary)', color: 'var(--color-text-secondary)', fontSize: 12 }}>
        {/* Real crypto icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TokenBTC size={14} variant="branded" />
          <TokenETH size={14} variant="branded" />
          <TokenSOL size={14} variant="branded" />
        </div>
        <span>Total Portfolio</span>
        <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>▾</span>
      </div>
    </div>
    <div style={{ fontSize: 28, fontWeight: 500, color: 'var(--color-text-primary)', marginTop: 8 }}>{formatUSD(total)}</div>
  </button>
                <div style={{ fontSize: 13, color: isPositive ? 'var(--color-text-success)' : 'var(--color-text-danger)', marginBottom: 16 }}>
                    {isPositive ? '▲' : '▼'} {Math.abs(portfolioChange).toFixed(2)}% (24h)
                </div>
                <div style={{ display: 'flex', gap: 28, justifyContent: 'center' }}>
                    <button className="action-btn" onClick={() => openModal({ type: 'deposit' })}>
                    <div className="icon-wrap" style={{ background: 'rgba(0,153,255,0.1)', border: '0.5px solid rgba(0,153,255,0.3)' }}>＋</div>
                    <span>Add Money</span>
                    </button>
                    <button className="action-btn" onClick={() => openModal({ type: 'withdraw' })}>
                    <div className="icon-wrap" style={{ background: 'rgba(139,92,246,0.1)', border: '0.5px solid rgba(139,92,246,0.3)' }}>↑</div>
                    <span>Withdraw</span>
                    </button>
                    <button className="action-btn" onClick={() => openModal({ type: 'swap' })}>
                    <div className="icon-wrap" style={{ background: 'rgba(16,185,129,0.1)', border: '0.5px solid rgba(16,185,129,0.3)' }}>↔</div>
                    <span>Convert</span>
                    </button>
                </div>
                </div>
              </div>

{/* Market Movers Section - Horizontally Scrollable */}
<div className="bg-background border border-border rounded-xl p-4 mb-6">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-sm font-semibold text-foreground">Market Movers 🔥</h3>
    <span className="text-xs text-muted-foreground">Last 24 hours</span>
  </div>
  <div style={{ 
    display: 'flex', 
    gap: '12px', 
    overflowX: 'auto', 
    paddingBottom: '6px',
    scrollbarWidth: 'thin'
  }}>
    {displayGainers.map(({ sym, change }) => {
      const price = prices[sym] || 0;
      // Get real logo from @web3icons
      let IconComponent = null;
      try {
        // Dynamically import the icon based on symbol
        const iconMap: Record<string, any> = {
          BTC: () => import('@web3icons/react').then(m => m.TokenBTC),
          ETH: () => import('@web3icons/react').then(m => m.TokenETH),
          SOL: () => import('@web3icons/react').then(m => m.TokenSOL),
          BNB: () => import('@web3icons/react').then(m => m.TokenBNB),
        };
        // For now use CIcon as fallback, but we'll use the actual component
      } catch (e) {
        // Fallback to CIcon
      }
      
      return (
        <div
          key={sym}
          style={{
            flex: '0 0 auto',
            width: '160px',
            padding: '12px',
            borderRadius: '12px',
            background: 'var(--color-background-secondary)',
            cursor: 'pointer',
          }}
          onClick={() => openModal({ type: 'crypto', sym })}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {getCryptoIcon(sym, 28)}
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{sym}</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                  {formatUSD(price)}
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#10b981' }}>+{change.toFixed(1)}%</div>
              <div style={{ fontSize: '10px', color: '#10b981' }}>▲</div>
            </div>
          </div>
          {/* Mini progress bar */}
          <div style={{ 
            height: '2px', 
            background: 'rgba(16,185,129,0.2)', 
            borderRadius: '2px',
            marginTop: '8px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              width: `${Math.min(change, 15)}%`, 
              height: '100%', 
              background: '#10b981',
              borderRadius: '2px'
            }} />
          </div>
        </div>
      );
    })}
  </div>
</div>

              {/* Crypto Grid */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 500, margin: 0, color: 'var(--color-text-primary)' }}>Cryptocurrencies</h3>
                </div>
                <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 6, scrollbarWidth: 'none' }}>
                  {majorCryptos.map(sym => (
                    <CryptoCard
                      key={sym}
                      sym={sym}
                      price={prices[sym] || 0}
                      holding={holdings[sym] || 0}
                      onClick={() => openModal({ type: 'crypto', sym })}
                    />
                  ))}
                  <button className="all-card" onClick={() => openModal({ type: 'all' })}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(0,153,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: 'var(--brand)' }}>›</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--brand)' }}>All Cryptos</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>20 assets</div>
                  </button>
                </div>
              </div>

              {/* Transactions */}
              <div className="card" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 500, margin: 0, color: 'var(--color-text-primary)' }}>Recent Transactions</h3>
                  <button style={{ background: 'none', border: 'none', color: 'var(--brand)', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>View all</button>
                </div>
                {transactions.map(tx => (
                  <TransactionRow key={tx.id} tx={tx} onClick={handleTransactionClick} />
                ))}
              </div>
            </div>
          )}

{activeNav === 'markets' && (
  <div className="content">
    <MarketOverview />
  </div>
)}

{activeNav === 'history' && (
  <div className="content">
    <History />
  </div>
)}

{activeNav === 'settings' && (
  <div className="content">
    <Settings />
  </div>
)}

{activeNav === 'asset-recovery' && (
  <div className="content">
    <AssetRecovery />
  </div>
)}

{activeNav !== 'dashboard' && activeNav !== 'markets' && activeNav !== 'settings' && activeNav !== 'history' && activeNav !== 'asset-recovery' && (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 400, gap: 12 }}>
    <div style={{ fontSize: 36 }}>🚧</div>
    <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--color-text-primary)' }}>{NAV_ITEMS.find(n => n.id === activeNav)?.label}</div>
    <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>This section is coming soon</div>
  </div>
)}
        </div>

        {/* Mobile Sidebar */}
        <MobileSidebar
          activeNav={activeNav}
          onNavChange={setActiveNav}
          user={user}
          onSignOut={handleSignOut}
        />
      </div>

      {/* Modals */}
      {modal?.type === 'crypto' && (
        <CryptoModal
  sym={modal.sym}
  holding={holdings[modal.sym] || 0}
  price={prices[modal.sym] || 0}
  priceChange={priceChanges[modal.sym] || 0}
  onClose={closeModal}
  onConvert={(sym) => {
    closeModal();
    setTimeout(() => openModal({ type: 'swap', sym }), 80);
  }}
  onWithdraw={(sym) => {
    closeModal();
    setTimeout(() => openModal({ type: 'withdraw', sym }), 80);
  }}
  onReceive={(sym) => {
    closeModal();
    setTimeout(() => openModal({ type: 'receive', sym }), 80);
  }}
/>
      )}

      {modal?.type === 'all' && (
        <AllCryptosModal
          prices={prices}
          priceChanges={priceChanges}
          onClose={closeModal}
          onSelect={(sym) => {
            closeModal();
            setTimeout(() => openModal({ type: 'crypto', sym }), 80);
          }}
        />
      )}

      {modal?.type === 'swap' && (
        <SwapModal
          initFrom={modal.sym || 'BTC'}
          initTo="ETH"
          prices={prices}
          holdings={holdings}
          onClose={closeModal}
        />
      )}

      {modal?.type === 'deposit' && (
        <DepositModal 
          prices={prices} 
          onClose={closeModal}
          onDepositSubmit={handleDepositSubmit}
        />
      )}

      {modal?.type === 'withdraw' && (
        <WithdrawModal
          initSym={modal.sym || null}
          prices={prices}
          holdings={holdings}
          onClose={closeModal}
        />
      )}

      {modal?.type === 'receive' && (
        <ReceiveModal sym={modal.sym} onClose={closeModal} />
      )}

      {/* Mobile Portfolio Bottom Sheet */}
      {modal?.type === 'portfolioMobile' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ maxWidth: '100%', width: '100%', height: '75vh', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, position: 'fixed', left: 0, right: 0, bottom: 0, background: 'var(--color-background-primary)', boxShadow: '0 -12px 30px rgba(0,0,0,0.12)', overflowY: 'auto' }}>
            <div className="modal-handle" style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}><div style={{ width: 36, height: 4, borderRadius: 4, background: 'var(--color-border-tertiary)' }} /></div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DonutChart 
  holdings={holdings} 
  prices={prices} 
  size={220} 
  change={portfolioChange}
  total={total}
/>
              </div>

              <div style={{ width: '100%', marginTop: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 8 }}>Balance Breakdown</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {getSortedHoldings(holdings, prices).map(h => (
                    <div key={h.sym} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--color-background-secondary)', borderRadius: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: h.crypto.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>{h.sym.charAt(0)}</div>
                        <div style={{ fontSize: 13, color: 'var(--color-text-primary)', fontWeight: 600 }}>{h.crypto.name}</div>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--color-text-primary)', fontWeight: 600 }}>{formatCrypto(h.amount)} {h.sym}</div>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={closeModal} style={{ marginTop: 12, width: '100%', padding: '12px 16px', borderRadius: 10, background: 'var(--brand)', color: '#fff', border: 'none', fontWeight: 600 }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Deposit Confirmation Modal */}
      {showConfirmation && lastDeposit && (
        <DepositConfirmationModal
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          depositDetails={lastDeposit}
        />
      )}
      
      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <TransactionDetailModal
          isOpen={!!selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          transaction={selectedTransaction}
        />
      )}
    </div>
  );
}

