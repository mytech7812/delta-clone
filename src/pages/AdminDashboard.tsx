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
import { UserCard } from '@/components/admin/UserCard';
import { TransactionCard } from '@/components/admin/TransactionCard';
import { formatUSD, formatCrypto } from '@/lib/utils';
import { fetchRealTimeData } from '@/lib/cryptoApi';
import { toast } from 'sonner';
import { Copy, Check, Edit2, Save, X, Plus } from 'lucide-react';
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

interface AdminWallet {
  id: number;
  crypto_symbol: string;
  wallet_address: string;
  network: string;
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
  
  // Wallet management states
  const [wallets, setWallets] = useState<AdminWallet[]>([]);
  const [editingWalletId, setEditingWalletId] = useState<number | null>(null);
  const [editAddress, setEditAddress] = useState('');
  const [copiedWalletId, setCopiedWalletId] = useState<number | null>(null);
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [newWallet, setNewWallet] = useState({ crypto_symbol: '', wallet_address: '', network: '' });

  // Load wallets from Supabase
  const loadWallets = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_wallets')
        .select('*')
        .order('crypto_symbol');
      
      if (error) throw error;
      setWallets(data || []);
    } catch (error) {
      console.error('Error loading wallets:', error);
    }
  };

  // Load real data from Supabase with caching to prevent zero flashes
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load cached data first to prevent zero flashes
        const cachedUsers = localStorage.getItem('anexmint:admin_users');
        const cachedTransactions = localStorage.getItem('anexmint:admin_transactions');
        
        if (cachedUsers) {
          setUsers(JSON.parse(cachedUsers));
        }
        if (cachedTransactions) {
          setTransactions(JSON.parse(cachedTransactions));
        }
        
        // Get current admin
        const admin = await getCurrentAdmin();
        setCurrentAdmin(admin);

        // Load cached prices first
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
        if (!fetchedPrices || !fetchedPrices.prices || Object.keys(fetchedPrices.prices).length === 0) {
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
        } catch (e) { /* ignore */ }

        // Get all users
        const usersData = await getAllUsers();

        // Get all balances
        const balancesData = await getAllUserBalances();

        // Load cached prices first (so users don't see zero)
let cachedPrices = {};
try {
  const raw = localStorage.getItem('anexmint:prices');
  if (raw) {
    const parsed = JSON.parse(raw);
    if (parsed && parsed.prices) {
      cachedPrices = parsed.prices;
      setPrices(cachedPrices); // Update state immediately with cached data
    }
  }
} catch (e) { /* ignore */ }

// Calculate total balance per user in USD using live prices (with fallback to cached)
const usersWithBalance = usersData.map(user => {
  const userBalances = balancesData.filter(b => b.user_id === user.user_id);
  
  // Use fetched prices if available, otherwise use cached prices from state
  const activePrices = Object.keys(selectedPrices).length > 0 ? selectedPrices : cachedPrices;
  
  const totalBalanceUSD = userBalances.reduce((sum, b) => {
    const sym = (b.crypto_symbol || '').toString().toUpperCase();
    const price = activePrices[sym] || 0;
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
        localStorage.setItem('anexmint:admin_users', JSON.stringify(usersWithBalance));

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
        localStorage.setItem('anexmint:admin_transactions', JSON.stringify(formattedTransactions));
        
        // Load wallets
        await loadWallets();
        
      } catch (error) {
        console.error('Error loading admin data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Handle wallet update
  const handleUpdateWallet = async (id: number, cryptoSymbol: string, newAddress: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('admin_wallets')
        .update({
          wallet_address: newAddress,
          updated_by: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast.success(`${cryptoSymbol} wallet address updated`);
      setEditingWalletId(null);
      await loadWallets();
    } catch (error) {
      console.error('Error updating wallet:', error);
      toast.error('Failed to update wallet');
    }
  };

  // Handle add new wallet
  const handleAddWallet = async () => {
    if (!newWallet.crypto_symbol || !newWallet.wallet_address) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('admin_wallets')
        .insert({
          crypto_symbol: newWallet.crypto_symbol.toUpperCase(),
          wallet_address: newWallet.wallet_address,
          network: newWallet.network || 'Default',
          updated_by: user?.id
        });

      if (error) throw error;

      toast.success(`${newWallet.crypto_symbol} wallet added`);
      setShowAddWallet(false);
      setNewWallet({ crypto_symbol: '', wallet_address: '', network: '' });
      await loadWallets();
    } catch (error) {
      console.error('Error adding wallet:', error);
      toast.error('Failed to add wallet');
    }
  };

  // Copy to clipboard
  const copyToClipboard = (address: string, id: number) => {
    navigator.clipboard.writeText(address);
    setCopiedWalletId(id);
    setTimeout(() => setCopiedWalletId(null), 2000);
    toast.success('Address copied');
  };

  // When a user is selected, fetch their individual balances
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

const handleUpdateTransactionStatus = async (id: number, status: 'approved' | 'rejected', notes: string) => {
  try {
    await updateTransactionStatus(id, status, currentAdmin?.id || 'admin', notes);
    
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
      
      const balancesData = await getAllUserBalances();
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
          const userBalancesFiltered = balancesData.filter(b => b.user_id === userId);
          const totalBalanceUSD = userBalancesFiltered.reduce((sum, b) => {
            const sym = (b.crypto_symbol || '').toString().toUpperCase();
            const p = currentPrices[sym] || 0;
            return sum + (Number(b.balance || 0) * p);
          }, 0);
          
          (async () => {
            try {
              if (selectedUser && selectedUser.id === userId) {
                const fresh = await getUserBalances(userId);
                setUserBalances(fresh || []);
                setSelectedUser(prev => prev ? { ...prev, totalBalance: totalBalanceUSD } : prev);
              }
            } catch (err) { /* ignore */ }
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
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-primary via-blue-400 to-cyan-400 animate-pulse flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-2xl">A</span>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">AnexMintMining</p>
            <p className="text-xs text-muted-foreground mt-1">Loading admin panel...</p>
          </div>
        </div>
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
            
        {/* Mobile Navigation Bar - Fixed for better visibility */}
        <div className="admin-sidebar-mobile" style={{ 
          display: 'flex', 
          overflowX: 'auto', 
          gap: '8px', 
          padding: '8px 12px',
          background: 'var(--color-background-primary)',
          borderBottom: '1px solid var(--color-border-tertiary)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          WebkitOverflowScrolling: 'touch'
        }}>
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'users', label: 'Users', icon: '👥' },
            { id: 'transactions', label: 'All', icon: '📋' },
            { id: 'deposits', label: 'Deposits', icon: '💰' },
            { id: 'withdrawals', label: 'Withdrawals', icon: '💸' },
            { id: 'wallets', label: 'Wallets', icon: '🏦' },
          ].map((item) => (
            <button
              key={item.id}
              className={`admin-nav-mobile ${activeNav === item.id ? 'active' : ''}`}
              onClick={() => setActiveNav(item.id)}
              style={{
                flexShrink: 0,
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 500,
                background: activeNav === item.id ? 'var(--brand)' : 'var(--color-background-secondary)',
                color: activeNav === item.id ? '#fff' : 'var(--color-text-secondary)',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {item.icon} {item.label}
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

{activeNav === 'wallets' && (
  <div
    style={{
      background: 'var(--color-background-primary)',
      border: '1px solid var(--color-border-tertiary)',
      borderRadius: 16,
      padding: 20,
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
      <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)' }}>
        Admin Wallet Addresses
      </h3>
    </div>

    {/* Add New Wallet Form - Select from existing cryptos */}
    <div style={{
      marginBottom: 20,
      padding: 16,
      background: 'var(--color-background-secondary)',
      borderRadius: 12,
      border: '1px solid var(--color-border-tertiary)'
    }}>
      <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--color-text-primary)' }}>Add New Wallet</h4>
      <div style={{ display: 'grid', gap: 12 }}>
        <select
          value={newWallet.crypto_symbol}
          onChange={(e) => setNewWallet({ ...newWallet, crypto_symbol: e.target.value })}
          style={{
            padding: '10px',
            background: 'var(--color-background-primary)',
            border: '1px solid var(--color-border-tertiary)',
            borderRadius: 8,
            color: 'var(--color-text-primary)',
            fontSize: 13,
          }}
        >
          <option value="">Select Cryptocurrency</option>
          <option value="BTC">Bitcoin (BTC)</option>
          <option value="ETH">Ethereum (ETH)</option>
          <option value="SOL">Solana (SOL)</option>
          <option value="USDT">Tether (USDT)</option>
          <option value="USDC">USD Coin (USDC)</option>
          <option value="BNB">BNB</option>
          <option value="XRP">XRP</option>
          <option value="ADA">Cardano (ADA)</option>
          <option value="DOGE">Dogecoin (DOGE)</option>
          <option value="MATIC">Polygon (MATIC)</option>
          <option value="DOT">Polkadot (DOT)</option>
          <option value="AVAX">Avalanche (AVAX)</option>
          <option value="LINK">Chainlink (LINK)</option>
          <option value="UNI">Uniswap (UNI)</option>
          <option value="ATOM">Cosmos (ATOM)</option>
          <option value="LTC">Litecoin (LTC)</option>
          <option value="SHIB">Shiba Inu (SHIB)</option>
          <option value="FTM">Fantom (FTM)</option>
          <option value="NEAR">NEAR Protocol (NEAR)</option>
          <option value="ALGO">Algorand (ALGO)</option>
          <option value="VET">VeChain (VET)</option>
          <option value="ICP">Internet Computer (ICP)</option>
        </select>
        <input
          type="text"
          placeholder="Wallet Address"
          value={newWallet.wallet_address}
          onChange={(e) => setNewWallet({ ...newWallet, wallet_address: e.target.value })}
          style={{
            padding: '10px',
            background: 'var(--color-background-primary)',
            border: '1px solid var(--color-border-tertiary)',
            borderRadius: 8,
            color: 'var(--color-text-primary)',
            fontSize: 13,
            fontFamily: 'monospace'
          }}
        />
        <input
          type="text"
          placeholder="Network (e.g., ERC20, BEP20, Solana)"
          value={newWallet.network}
          onChange={(e) => setNewWallet({ ...newWallet, network: e.target.value })}
          style={{
            padding: '10px',
            background: 'var(--color-background-primary)',
            border: '1px solid var(--color-border-tertiary)',
            borderRadius: 8,
            color: 'var(--color-text-primary)',
            fontSize: 13,
          }}
        />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            onClick={() => {
              setShowAddWallet(false);
              setNewWallet({ crypto_symbol: '', wallet_address: '', network: '' });
            }}
            style={{ padding: '8px 16px', background: 'var(--color-background-secondary)', border: '1px solid var(--color-border-tertiary)', borderRadius: 6, cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            onClick={handleAddWallet}
            disabled={!newWallet.crypto_symbol || !newWallet.wallet_address}
            style={{ 
              padding: '8px 16px', 
              background: (!newWallet.crypto_symbol || !newWallet.wallet_address) ? 'var(--color-background-secondary)' : 'var(--brand)', 
              border: 'none', 
              borderRadius: 6, 
              color: (!newWallet.crypto_symbol || !newWallet.wallet_address) ? 'var(--color-text-secondary)' : '#fff', 
              cursor: (!newWallet.crypto_symbol || !newWallet.wallet_address) ? 'not-allowed' : 'pointer' 
            }}
          >
            Add Wallet
          </button>
        </div>
      </div>
    </div>

    {/* Wallets List - Edit address only, not crypto name */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {wallets.map(wallet => (
        <div
          key={wallet.id}
          style={{
            padding: 16,
            background: 'var(--color-background-secondary)',
            borderRadius: 12,
            border: '1px solid var(--color-border-tertiary)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {wallet.crypto_symbol} Wallet
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {editingWalletId === wallet.id ? (
                <>
                  <button
                    onClick={() => handleUpdateWallet(wallet.id, wallet.crypto_symbol, editAddress)}
                    style={{ padding: '4px 8px', background: 'rgba(16,185,129,0.15)', border: 'none', borderRadius: 6, color: '#10b981', cursor: 'pointer' }}
                  >
                    <Save size={14} /> Save
                  </button>
                  <button
                    onClick={() => setEditingWalletId(null)}
                    style={{ padding: '4px 8px', background: 'rgba(239,68,68,0.15)', border: 'none', borderRadius: 6, color: '#ef4444', cursor: 'pointer' }}
                  >
                    <X size={14} /> Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setEditingWalletId(wallet.id);
                      setEditAddress(wallet.wallet_address);
                    }}
                    style={{ padding: '4px 8px', background: 'var(--color-background-primary)', border: '1px solid var(--color-border-tertiary)', borderRadius: 6, cursor: 'pointer' }}
                  >
                    <Edit2 size={14} /> Edit Address
                  </button>
                  <button
                    onClick={() => copyToClipboard(wallet.wallet_address, wallet.id)}
                    style={{ padding: '4px 8px', background: 'var(--color-background-primary)', border: '1px solid var(--color-border-tertiary)', borderRadius: 6, cursor: 'pointer' }}
                  >
                    {copiedWalletId === wallet.id ? <Check size={14} color="#10b981" /> : <Copy size={14} />} Copy
                  </button>
                </>
              )}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Network: {wallet.network || 'Default'}</div>
            <div
              style={{
                fontSize: 12,
                fontFamily: 'monospace',
                color: 'var(--color-text-secondary)',
                wordBreak: 'break-all',
              }}
            >
              {editingWalletId === wallet.id ? (
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: 'var(--color-background-primary)',
                    border: '1px solid var(--color-border-tertiary)',
                    borderRadius: 6,
                    color: 'var(--color-text-primary)',
                    fontSize: 12,
                    fontFamily: 'monospace'
                  }}
                />
              ) : (
                wallet.wallet_address
              )}
            </div>
          </div>
        </div>
      ))}
    </div>

    {wallets.length === 0 && (
      <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-secondary)' }}>
        No wallets configured. Add a wallet above.
      </div>
    )}
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

              {/* Balance Update Section */}
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--color-border-tertiary)' }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--color-text-primary)' }}>
                  Set Balance (USD)
                </h4>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                    Select Cryptocurrency
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
                    Amount (USD)
                  </div>
                  <input
                    id="cryptoAmount"
                    type="number"
                    step="any"
                    placeholder="Enter USD amount"
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
                      setConversionMessage('Please enter a valid USD amount');
                      return;
                    }

                    let assetPrice = prices[crypto.toUpperCase()] || prices[crypto];
                    if (!assetPrice) {
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
                      setConversionMessage('Price unavailable — please try again later');
                      return;
                    }

                    const cryptoAmount = usdAmount / assetPrice;

                    if (selectedUser.onUpdateBalance) {
                      await selectedUser.onUpdateBalance(selectedUser.id, crypto, cryptoAmount);
                      toast.success(`Set ${selectedUser.name}'s ${crypto} balance to ${cryptoAmount.toFixed(6)} ${crypto}`);
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
                  This will REPLACE the user's current balance for the selected asset
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