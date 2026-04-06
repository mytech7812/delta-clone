import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { 
  getAllUsers, 
  getAllUserBalances, 
  getUserBalances,
  getAllTransactions, 
  updateTransactionStatus,
  updateUserBalance,
  getCurrentAdmin 
} from '@/lib/database';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { UserCard } from '@/components/admin/usercard';
import { TransactionCard } from '@/components/admin/transactioncard';
import { formatUSD, formatCrypto } from '@/lib/utils';
import { fetchRealTimeData } from '@/lib/cryptoApi';
import { toast } from 'sonner';
import '@/styles/dashboard.css';

type TransactionStatus = 'pending' | 'approved' | 'rejected';
type TransactionType = 'deposit' | 'withdraw' | 'swap';

interface Transaction {
  id: number;
  type: TransactionType;
  userEmail: string;
  userName: string;
  sym?: string;
  amount?: number;
  usd: number;
  date: string;
  status: TransactionStatus;
  from?: string;
  to?: string;
  txHash?: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  totalBalance: number;
  status: 'active' | 'suspended';
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userBalances, setUserBalances] = useState<any[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [priceLoading, setPriceLoading] = useState(false);
  const [pricesAreStale, setPricesAreStale] = useState(false);
  const [conversionMessage, setConversionMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentAdmin, setCurrentAdmin] = useState<any>(null);

  // Load real data from Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Get current admin
        const admin = await getCurrentAdmin();
        setCurrentAdmin(admin);

        // Load cached prices first so UI doesn't show zeros while fetching
        try {
          const raw = localStorage.getItem('anexmint:prices');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && parsed.prices) setPrices(parsed.prices);
            if (parsed && parsed.ts) {
              const age = Date.now() - Number(parsed.ts || 0);
              setPricesAreStale(age > 10 * 60 * 1000);
            }
          }
        } catch (e) { /* ignore */ }

        // Fetch live prices
        let fetchedPrices = await fetchRealTimeData();
        // fetchRealTimeData returns { prices, changes }
        if (!fetchedPrices || !fetchedPrices.prices || Object.keys(fetchedPrices.prices).length === 0) {
          // Retry once if CoinGecko failed to respond
          try {
            fetchedPrices = await fetchRealTimeData();
          } catch (err) {
            console.warn('Retry for prices failed', err);
          }
        }
        const selectedPrices = (fetchedPrices && fetchedPrices.prices) || {};
        setPrices(selectedPrices);
        try {
          const payload = { prices: selectedPrices, changes: (fetchedPrices && fetchedPrices.changes) || {}, ts: Date.now() };
          localStorage.setItem('anexmint:prices', JSON.stringify(payload));
          setPricesAreStale(false);
        } catch (e) {
          // ignore
        }

        // Get all users
        const usersData = await getAllUsers();

        // Get all balances
        const balancesData = await getAllUserBalances();

        // Calculate total balance per user in USD using live prices
        const usersWithBalance = usersData.map(user => {
          const userBalances = balancesData.filter(b => b.user_id === user.user_id);
          const totalBalanceUSD = userBalances.reduce((sum, b) => {
            const sym = (b.crypto_symbol || '').toString().toUpperCase();
            const price = (fetchedPrices.prices && fetchedPrices.prices[sym]) || 0;
            return sum + (Number(b.balance || 0) * price);
          }, 0);
          return {
            id: user.user_id,
            email: user.email || 'No email',
            name: user.full_name || 'Unknown',
            createdAt: user.created_at,
            totalBalance: totalBalanceUSD,
            status: 'active' as const,
          };
        });

        setUsers(usersWithBalance);

        // Get all transactions
        const transactionsData = await getAllTransactions();
        const formattedTransactions: Transaction[] = transactionsData.map(tx => ({
          id: tx.id,
          type: tx.type,
          userEmail: tx.userEmail,
          userName: tx.userName,
          sym: tx.crypto_symbol,
          amount: tx.amount,
          usd: tx.usd_amount,
          date: new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          status: tx.status,
          from: tx.from_symbol,
          to: tx.to_symbol,
        }));
        
        setTransactions(formattedTransactions);
      } catch (error) {
        console.error('Error loading admin data:', error);
        // Silent handling: do not surface a toast to the UI for price/data load failures
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // When a user is selected, fetch their individual balances so admin can view them
  useEffect(() => {
    const loadUserBalances = async () => {
      if (!selectedUser) {
        setUserBalances([]);
        return;
      }
      try {
        const b = await getUserBalances(selectedUser.id);
        setUserBalances(b || []);
      } catch (err) {
        console.error('Failed to load user balances', err);
        setUserBalances([]);
      }
    };

    loadUserBalances();
  }, [selectedUser]);

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    pendingDeposits: transactions.filter(t => t.type === 'deposit' && t.status === 'pending').length,
    pendingWithdrawals: transactions.filter(t => t.type === 'withdraw' && t.status === 'pending').length,
    totalVolume: transactions.reduce((sum, t) => sum + t.usd, 0),
  };

  const handleUpdateTransactionStatus = async (id: number, status: 'approved' | 'rejected') => {
    try {
      await updateTransactionStatus(id, status, currentAdmin?.id || 'admin', `Transaction ${status} by admin`);
      
      // Update local state
      setTransactions(prev =>
        prev.map(tx =>
          tx.id === id ? { ...tx, status: status as TransactionStatus } : tx
        )
      );
      
      toast.success(`Transaction ${status}!`);
      
      // Reload users to update balances if deposit was approved
      if (status === 'approved') {
        const balancesData = await getAllUserBalances();
        setUsers(prev => prev.map(user => {
          const userBalances = balancesData.filter(b => b.user_id === user.id);
          const totalBalanceUSD = userBalances.reduce((sum, b) => {
            const sym = (b.crypto_symbol || '').toString().toUpperCase();
            const p = prices[sym] || 0;
            return sum + (Number(b.balance || 0) * p);
          }, 0);
          return { ...user, totalBalance: totalBalanceUSD };
        }));
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast.error('Failed to update transaction');
    }
  };

  const handleUpdateUserBalance = async (userId: string, cryptoSymbol: string, newBalance: number) => {
    try {
      await updateUserBalance(userId, cryptoSymbol, newBalance, currentAdmin?.id || 'admin', 'Manual balance adjustment');
      toast.success(`Balance updated for ${cryptoSymbol}`);
      
      // Update local state
      const balancesData = await getAllUserBalances();
      // Recompute totals in USD using current prices; fetch fresh prices if needed
      let currentPrices = prices;
      if (!currentPrices || Object.keys(currentPrices).length === 0) {
        try {
          const fresh = await fetchRealTimeData();
          const freshPrices = (fresh && fresh.prices) || {};
          currentPrices = freshPrices;
          setPrices(freshPrices);
        } catch (err) {
          console.error('Failed to refresh prices', err);
        }
      }

      setUsers(prev => prev.map(user => {
        if (user.id === userId) {
          const userBalances = balancesData.filter(b => b.user_id === userId);
          const totalBalanceUSD = userBalances.reduce((sum, b) => {
            const sym = (b.crypto_symbol || '').toString().toUpperCase();
            const p = currentPrices[sym] || 0;
            return sum + (Number(b.balance || 0) * p);
          }, 0);
          // Refresh selected user's balances if modal open
          (async () => {
            try {
              if (selectedUser && selectedUser.id === userId) {
                const fresh = await getUserBalances(userId);
                setUserBalances(fresh || []);
                setSelectedUser(prev => prev ? { ...prev, totalBalance: totalBalanceUSD } : prev);
              }
            } catch (err) {
              // ignore
            }
          })();

          return { ...user, totalBalance: totalBalanceUSD };
        }
        return user;
      }));
    } catch (error) {
      console.error('Error updating balance:', error);
      toast.error('Failed to update balance');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-background-tertiary)' }}>
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="app">
      <AdminSidebar activeNav={activeNav} onNavChange={setActiveNav} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {/* Topbar */}
        <div className="topbar">
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0, color: 'var(--color-text-primary)' }}>
              Admin Dashboard
            </h2>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => window.location.href = '/dashboard'}
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
            >
              Go to Dashboard
            </button>
          </div>
        </div>
            
        {/* Mobile Navigation Bar */}
        <div className="admin-sidebar-mobile">
          {[
            { id: 'overview', label: '📊 Overview' },
            { id: 'users', label: '👥 Users' },
            { id: 'transactions', label: '📋 All' },
            { id: 'deposits', label: '💰 Deposits' },
            { id: 'withdrawals', label: '💸 Withdrawals' },
            { id: 'wallets', label: '🏦 Wallets' },
          ].map((item) => (
            <button
              key={item.id}
              className={`admin-nav-mobile ${activeNav === item.id ? 'active' : ''}`}
              onClick={() => setActiveNav(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="main">
          <div className="content">
            {/* Overview Section */}
            {activeNav === 'overview' && (
              <>
                <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }}>
                  {[
                    { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: '#0099ff' },
                    { label: 'Active Users', value: stats.activeUsers, icon: '✅', color: '#10b981' },
                    { label: 'Pending Deposits', value: stats.pendingDeposits, icon: '💰', color: '#f59e0b' },
                    { label: 'Pending Withdrawals', value: stats.pendingWithdrawals, icon: '💸', color: '#ef4444' },
                    { label: 'Total Volume', value: formatUSD(stats.totalVolume), icon: '📊', color: '#8b5cf6' },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      style={{
                        background: 'var(--color-background-primary)',
                        border: '1px solid var(--color-border-tertiary)',
                        borderRadius: 16,
                        padding: 16,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        <span style={{ fontSize: 24 }}>{stat.icon}</span>
                        <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{stat.label}</span>
                      </div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: stat.color }}>
                        {stat.value}
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    background: 'var(--color-background-primary)',
                    border: '1px solid var(--color-border-tertiary)',
                    borderRadius: 16,
                    padding: 20,
                  }}
                >
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--color-text-primary)' }}>
                    Recent Transactions
                  </h3>
                  {transactions.slice(0, 5).map(tx => (
                    <TransactionCard
                      key={tx.id}
                      transaction={tx}
                      onUpdateStatus={handleUpdateTransactionStatus}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Users Section */}
            {activeNav === 'users' && (
              <div
                style={{
                  background: 'var(--color-background-primary)',
                  border: '1px solid var(--color-border-tertiary)',
                  borderRadius: 16,
                  padding: 20,
                }}
              >
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--color-text-primary)' }}>
                  All Users ({users.length})
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                  {users.map(user => (
                    <UserCard
                      key={user.id}
                      user={user}
                      onViewDetails={(u) => setSelectedUser({ ...u, onUpdateBalance: handleUpdateUserBalance })}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Transactions Section */}
            {(activeNav === 'transactions' || activeNav === 'deposits' || activeNav === 'withdrawals') && (
              <div
                style={{
                  background: 'var(--color-background-primary)',
                  border: '1px solid var(--color-border-tertiary)',
                  borderRadius: 16,
                  padding: 20,
                }}
              >
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--color-text-primary)' }}>
                  {activeNav === 'deposits' ? 'Pending Deposits' : activeNav === 'withdrawals' ? 'Pending Withdrawals' : 'All Transactions'}
                </h3>
                {transactions
                  .filter(tx => {
                    if (activeNav === 'deposits') return tx.type === 'deposit' && tx.status === 'pending';
                    if (activeNav === 'withdrawals') return tx.type === 'withdraw' && tx.status === 'pending';
                    return true;
                  })
                  .map(tx => (
                    <TransactionCard
                      key={tx.id}
                      transaction={tx}
                      onUpdateStatus={handleUpdateTransactionStatus}
                    />
                  ))}
              </div>
            )}

            {/* Admin Wallets Section */}
            {activeNav === 'wallets' && (
              <div
                style={{
                  background: 'var(--color-background-primary)',
                  border: '1px solid var(--color-border-tertiary)',
                  borderRadius: 16,
                  padding: 20,
                }}
              >
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--color-text-primary)' }}>
                  Admin Wallet Addresses
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {['BTC', 'ETH', 'USDT', 'USDC', 'SOL'].map(coin => (
                    <div
                      key={coin}
                      style={{
                        padding: 16,
                        background: 'var(--color-background-secondary)',
                        borderRadius: 12,
                        border: '1px solid var(--color-border-tertiary)',
                      }}
                    >
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 8 }}>
                        {coin} Wallet
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          fontFamily: 'monospace',
                          color: 'var(--color-text-secondary)',
                          wordBreak: 'break-all',
                        }}
                      >
                        {coin === 'BTC' && 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'}
                        {coin === 'ETH' && '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0'}
                        {coin === 'USDT' && '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0'}
                        {coin === 'USDC' && '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0'}
                        {coin === 'SOL' && '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Details Modal with Balance Update */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ maxWidth: 500, margin: '0 auto' }}>
            <div className="modal-handle"><div /></div>
            <div className="modal-header">
              <h3>User Details</h3>
              <button className="icon-btn" onClick={() => setSelectedUser(null)}>×</button>
            </div>
            <div style={{ padding: '0 20px 24px' }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, var(--brand), var(--color-text-info))`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 32,
                    fontWeight: 600,
                    color: '#fff',
                    margin: '0 auto',
                  }}
                >
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
              </div>
              
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Full Name</div>
                <div style={{ fontSize: 15, color: 'var(--color-text-primary)' }}>{selectedUser.name}</div>
              </div>
              
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Email</div>
                <div style={{ fontSize: 15, color: 'var(--color-text-primary)' }}>{selectedUser.email}</div>
              </div>
              
<div style={{ marginBottom: 16 }}>
  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Total Balance</div>
  <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--color-text-success)' }}>
    {formatUSD(selectedUser.totalBalance)}
  </div>
</div>
              
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Joined</div>
                <div style={{ fontSize: 15, color: 'var(--color-text-primary)' }}>
                  {new Date(selectedUser.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 8 }}>Current Balances</div>
                {userBalances && userBalances.length > 0 ? (
                  <div style={{ display: 'grid', gap: 8 }}>
                    {userBalances.map((b: any) => {
                      const sym = (b.crypto_symbol || '').toString().toUpperCase();
                      const cryptoAmt = Number(b.balance || 0);
                      const usdValue = (prices && prices[sym]) ? cryptoAmt * prices[sym] : 0;
                      return (
                        <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--color-background-secondary)', borderRadius: 8, border: '1px solid var(--color-border-tertiary)' }}>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>{sym}</div>
                            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{formatCrypto(cryptoAmt)}</div>
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>{formatUSD(usdValue)}</div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>No balances found for this user.</div>
                )}
              </div>

{/* Balance Update Section - Direct crypto amount */}
{/* Balance Update Section - Admin enters USD, convert to crypto before storing */}
<div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--color-border-tertiary)' }}>
  <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--color-text-primary)' }}>
    Set Balance (USD)
  </h4>
  <div style={{ marginBottom: 12 }}>
    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
      Select Cryptocurrency (the USD amount will be converted to this asset)
    </div>
    <select
      id="cryptoSelect"
      style={{
        width: '100%',
        padding: '10px',
        background: 'var(--color-background-secondary)',
        border: '1px solid var(--color-border-tertiary)',
        borderRadius: 8,
        color: 'var(--color-text-primary)',
        fontSize: 13,
      }}
    >
      <option value="BTC">Bitcoin (BTC)</option>
      <option value="ETH">Ethereum (ETH)</option>
      <option value="SOL">Solana (SOL)</option>
      <option value="USDT">Tether (USDT)</option>
    </select>
  </div>
  <div style={{ marginBottom: 12 }}>
    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
        Amount (Enter USD amount)

    </div>
    <input
      id="cryptoAmount"
      type="number"
      step="any"
      placeholder="Enter USD amount (e.g., 1000)"
      style={{
        width: '100%',
        padding: '10px',
        background: 'var(--color-background-secondary)',
        border: '1px solid var(--color-border-tertiary)',
        borderRadius: 8,
        color: 'var(--color-text-primary)',
        fontSize: 13,
      }}
    />
  </div>
  {conversionMessage && (
    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 8 }}>{conversionMessage}</div>
  )}
  <button
    onClick={async () => {
      setConversionMessage(null);
      const crypto = (document.getElementById('cryptoSelect') as HTMLSelectElement).value;
      const usdAmount = parseFloat((document.getElementById('cryptoAmount') as HTMLInputElement).value);

      if (isNaN(usdAmount) || usdAmount <= 0) {
        // silent UI feedback: inline message
        setConversionMessage('Please enter a valid USD amount');
        return;
      }

      // Ensure we have a price for the selected asset
      let assetPrice = prices[crypto.toUpperCase()] || prices[crypto];
      if (!assetPrice) {
        // silently retry and show inline status
        setPriceLoading(true);
        setConversionMessage('Fetching latest price...');
        try {
          const fresh = await fetchRealTimeData();
          const freshPrices = (fresh && fresh.prices) || {};
          setPrices(freshPrices);
          assetPrice = freshPrices[crypto.toUpperCase()] || 0;
        } catch (err) {
          console.error('Failed to fetch price for conversion', err);
        } finally {
          setPriceLoading(false);
        }
      }

      if (!assetPrice || assetPrice <= 0) {
        // silent failure: show inline message but do not toast
        setConversionMessage('Price unavailable for selected asset — please try again later');
        return;
      }

      const cryptoAmount = usdAmount / assetPrice;

      if (selectedUser.onUpdateBalance) {
        await selectedUser.onUpdateBalance(selectedUser.id, crypto, cryptoAmount);
        toast.success(`Set ${selectedUser.name}'s ${crypto} balance to ${cryptoAmount.toFixed(6)} ${crypto} (≈ ${formatUSD(usdAmount)})`);
        setSelectedUser(null);
      }
    }}
    disabled={priceLoading}
    style={{
      width: '100%',
      padding: '10px',
      background: priceLoading ? 'var(--color-background-secondary)' : 'var(--brand)',
      border: 'none',
      borderRadius: 8,
      color: '#fff',
      fontSize: 13,
      fontWeight: 500,
      cursor: priceLoading ? 'not-allowed' : 'pointer',
    }}
  >
    Set Balance
  </button>
  <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 8 }}>
    This will REPLACE the user's current balance for the selected asset with the USD amount converted to crypto
  </p>
</div>
              
              <button
                className="primary-btn"
                onClick={() => setSelectedUser(null)}
                style={{ marginTop: 16 }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}