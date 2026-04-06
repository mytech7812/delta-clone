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
import '@/styles/dashboard.css';

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
        console.error('Failed to fetch user transactions:', error);
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
      }));

      setTransactions(mapped);
    } catch (err) {
      console.error('Error fetching transactions:', err);
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
    } catch (error) {
      console.error('Error fetching balances:', error);
    } finally {
      setHoldingsLoading(false);
    }
  };

  // Check authentication
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (!session) {
        navigate('/');
      } else {
        setUserEmail(session.user.email || null);
        setUser(session.user);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/');
        setUser(null);
        setUserEmail(null);
      } else {
        setUserEmail(session.user.email || null);
        setUser(session.user);
      }
    });

    return () => { mounted = false; try { subscription.unsubscribe(); } catch (e) { /* ignore */ } };
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

    const setupRealtime = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Listen for changes to this user's balances
        balancesSub = (supabase as any)
          .from(`user_balances:user_id=eq.${user.id}`)
          .on('INSERT', () => refreshBalances())
          .on('UPDATE', () => refreshBalances())
          .subscribe();

        // Listen for changes to this user's transactions
        txSub = (supabase as any)
          .from(`transactions:user_id=eq.${user.id}`)
          .on('INSERT', () => fetchUserTransactions())
          .on('UPDATE', () => fetchUserTransactions())
          .subscribe();
      } catch (err) {
        console.error('Failed to setup realtime subscriptions', err);
      }
    };

    setupRealtime();

    return () => {
      try {
        if (balancesSub && typeof (balancesSub as any).unsubscribe === 'function') (balancesSub as any).unsubscribe();
        if (txSub && typeof (txSub as any).unsubscribe === 'function') (txSub as any).unsubscribe();
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
useEffect(() => {
  const loadRealTimeData = async () => {
    try {
      const { prices: realPrices, changes: realChanges } = await fetchRealTimeData();
      setPrices(realPrices);
      setPriceChanges(realChanges);
      try {
        const payload = { prices: realPrices, changes: realChanges, ts: Date.now() };
        localStorage.setItem('anexmint:prices', JSON.stringify(payload));
        setPricesAreStale(false);
      } catch (e) {
        // ignore storage failures
      }
    } catch (error) {
      console.error('Failed to fetch real-time data:', error);
      // Intentionally silent: do not show toast for price fetch failures
    }
  };
  // Load cached prices first so UI doesn't show zeros while fetching
  try {
    const raw = localStorage.getItem('anexmint:prices');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.prices) setPrices(parsed.prices);
      if (parsed && parsed.changes) setPriceChanges(parsed.changes);
      if (parsed && parsed.ts) {
        const age = Date.now() - Number(parsed.ts || 0);
        setPricesAreStale(age > 10 * 60 * 1000); // stale if older than 10 minutes
      }
    }
  } catch (e) { /* ignore parse/storage errors */ }

  loadRealTimeData();
  const interval = setInterval(loadRealTimeData, 30000); // Update every 30 seconds

  return () => clearInterval(interval);
}, []);

// Calculate portfolio 24h change based on actual holdings and real price changes
const calculatePortfolioChange = () => {
  if (Object.keys(holdings).length === 0) return 0;
  if (Object.keys(prices).length === 0) return 0;
  if (Object.keys(priceChanges).length === 0) return 0;
  
  let totalCurrentValue = 0;
  let totalPreviousValue = 0;
  
  for (const [sym, amount] of Object.entries(holdings)) {
    if (amount === 0) continue;
    
    const currentPrice = prices[sym] || 0;
    const changePercent = priceChanges[sym] || 0;
    
    if (currentPrice === 0) continue;
    
    totalCurrentValue += amount * currentPrice;
    // Calculate what the price was 24h ago based on current price and change percent
    const previousPrice = currentPrice / (1 + changePercent / 100);
    totalPreviousValue += amount * previousPrice;
  }
  
  if (totalPreviousValue === 0) return 0;
  return ((totalCurrentValue - totalPreviousValue) / totalPreviousValue) * 100;
};

const portfolioChange = calculatePortfolioChange();
const isPositive = portfolioChange >= 0;
const total = calculateTotalUSD(holdings, prices);
const sortedHoldings = getSortedHoldings(holdings, prices);
const majorCryptos = ["BTC", "ETH", "SOL", "USDT"];

const openModal = (newModal: ModalType) => setModal(newModal);
const closeModal = () => setModal(null);

const handleSignOut = async () => {
  await supabase.auth.signOut();
  navigate('/');
};

if (loading || holdingsLoading) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary via-blue-400 to-cyan-400 animate-pulse flex items-center justify-center">
          <span className="text-white font-bold text-lg">A</span>
        </div>
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
      </div>
    </div>
  );
}
  return (
    <div className="app">
      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {/* Topbar */}
        <div className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="logo-mark mobile-only" style={{ display: 'none' }}>A</div>
            <div>
              <h2 style={{ fontSize: activeNav === 'dashboard' ? 15 : 15, fontWeight: 500, margin: 0, color: 'var(--color-text-primary)' }}>
                {activeNav === 'dashboard' ? (
                  (() => {
                    const meta = (user && (user.user_metadata || {})) || {};
                    const first = (meta.first_name || meta.firstName || '').toString().trim();
                    const full = (meta.full_name || meta.fullName || '').toString().trim();
                    const fallback = user && user.email ? user.email.split('@')[0] : 'there';
                    const name = first || (full ? full.split(' ')[0] : '') || fallback;
                    return `Hi, ${name}`;
                  })()
                ) : (
                  NAV_ITEMS.find(n => n.id === activeNav)?.label || 'Dashboard'
                )}
              </h2>
              <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  {pricesAreStale && (
                    <span style={{ fontSize: 11, color: 'var(--color-text-warning)', background: 'rgba(245,158,11,0.06)', padding: '4px 8px', borderRadius: 8 }}>
                      Prices may be delayed
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold"
                aria-label="User menu"
                style={{ border: 'none' }}
              >
                {(() => {
                  const meta = (user && (user.user_metadata || {})) || {};
                  const first = (meta.first_name || meta.firstName || '').toString().trim();
                  const last = (meta.last_name || meta.lastName || '').toString().trim();
                  const full = (meta.full_name || meta.fullName || '').toString().trim();
                  let initials = '';
                  if (first && last) initials = `${first.charAt(0)}${last.charAt(0)}`;
                  else if (full) {
                    const parts = full.split(' ').filter(Boolean);
                    initials = parts.length >= 2 ? `${parts[0].charAt(0)}${parts[parts.length-1].charAt(0)}` : full.slice(0,2);
                  } else if (user && user.email) initials = user.email.charAt(0).toUpperCase();
                  return initials.toUpperCase();
                })()}
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-background border border-border rounded-lg shadow-md py-2 z-50">
                  <div className="px-4 py-2">
                    <div className="font-medium text-sm text-foreground">
                      {((user && user.user_metadata && (user.user_metadata.full_name || user.user_metadata.fullName)) || (user && user.email) || 'User')}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{user && user.email}</div>
                  </div>
                  <div className="border-t border-border mt-2" />
                  <button
                    className="w-full text-left px-4 py-2 text-sm hover:bg-surface"
                    onClick={async () => { await supabase.auth.signOut(); navigate('/'); }}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            <button
              className="desktop-only"
              style={{
                background: 'var(--brand)',
                border: 'none',
                borderRadius: 8,
                padding: '7px 14px',
                cursor: 'pointer',
                color: '#fff',
                fontSize: 12,
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
                {/* Desktop Layout */}
                <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
                  <DonutChart 
                    holdings={holdings} 
                    prices={prices} 
                    size={190} 
                    change={portfolioChange}
                    />
                  
                  <div className="balance-legend">
                    {sortedHoldings.map(({ sym, amount, usd, crypto }) => (
                      <div key={sym} className="legend-row">
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: crypto.color, flexShrink: 0 }} />
                        <CIcon sym={sym} size={28} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                            {crypto.name}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                            {formatCrypto(amount)} {sym}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                            {formatUSD(usd)}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                            {((usd / total) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0 }}>
                    <button
                      style={{
                        padding: '11px 22px',
                        borderRadius: 10,
                        border: 'none',
                        background: 'var(--brand)',
                        color: '#fff',
                        fontWeight: 500,
                        fontSize: 13,
                        cursor: 'pointer',
                      }}
                      onClick={() => openModal({ type: 'deposit' })}
                    >
                      ＋ Add Money
                    </button>
                    <button
                      style={{
                        padding: '11px 22px',
                        borderRadius: 10,
                        border: '0.5px solid var(--color-border-secondary)',
                        background: 'none',
                        color: 'var(--color-text-primary)',
                        fontWeight: 500,
                        fontSize: 13,
                        cursor: 'pointer',
                      }}
                      onClick={() => openModal({ type: 'withdraw' })}
                    >
                      ↑ Withdraw
                    </button>
                    <button
                      style={{
                        padding: '11px 22px',
                        borderRadius: 10,
                        border: '0.5px solid var(--color-border-secondary)',
                        background: 'none',
                        color: 'var(--color-text-primary)',
                        fontWeight: 500,
                        fontSize: 13,
                        cursor: 'pointer',
                      }}
                      onClick={() => openModal({ type: 'swap' })}
                    >
                      ↔ Convert
                    </button>
                  </div>
                </div>

                {/* Mobile Layout */}
                <div className="mobile-balance mobile-only" style={{ flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <button onClick={() => setModal({ type: 'portfolioMobile' })} style={{ background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer' }} aria-label="Open portfolio breakdown">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 9999, background: 'var(--color-background-secondary)', border: '1px solid var(--color-border-tertiary)', color: 'var(--color-text-secondary)', fontSize: 12 }}>
                      <span>💰 Total Portfolio</span>
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

          {activeNav !== 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 400, gap: 12 }}>
              <div style={{ fontSize: 36 }}>🚧</div>
              <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--color-text-primary)' }}>{NAV_ITEMS.find(n => n.id === activeNav)?.label}</div>
              <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>This section is coming soon</div>
            </div>
          )}
        </div>

        {/* Bottom Navigation (Mobile) */}
        <div className="bnav">
          {NAV_ITEMS.map(({ id, label, icon }) => (
            <button
              key={id}
              className={`bnav-btn${activeNav === id ? ' active' : ''}`}
              onClick={() => setActiveNav(id)}
            >
              <span style={{ fontSize: 18 }}>{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Modals */}
      {modal?.type === 'crypto' && (
        <CryptoModal
          sym={modal.sym}
          holding={holdings[modal.sym] || 0}
          price={prices[modal.sym] || 0}
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
                <DonutChart holdings={holdings} prices={prices} size={220} change={portfolioChange} centerLabel="TOTL BALANCE" />
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