import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { formatUSD, formatCrypto } from '@/lib/utils';
import { CIcon } from '@/components/CIcon';
import { TransactionDetailModal } from '@/components/modals/TransactionDetailModal';

type FilterType = 'all' | 'deposit' | 'withdraw' | 'swap';
type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

interface Transaction {
  id: number;
  type: 'deposit' | 'withdraw' | 'swap';
  crypto_symbol?: string;
  amount?: number;
  usd_amount: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  from_symbol?: string;
  to_symbol?: string;
  from_amount?: number;
  to_amount?: number;
  admin_notes?: string;
}

export function History() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-500';
      case 'rejected': return 'text-red-500';
      default: return 'text-yellow-500';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500/10';
      case 'rejected': return 'bg-red-500/10';
      default: return 'bg-yellow-500/10';
    }
  };

  const getTransactionTitle = (tx: Transaction) => {
    if (tx.type === 'deposit') return `Deposit ${tx.crypto_symbol}`;
    if (tx.type === 'withdraw') return `Withdraw ${tx.crypto_symbol}`;
    return `Swap ${tx.from_symbol} → ${tx.to_symbol}`;
  };

  const filteredTransactions = transactions.filter(tx => {
    if (filterType !== 'all' && tx.type !== filterType) return false;
    if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        tx.crypto_symbol?.toLowerCase().includes(searchLower) ||
        tx.from_symbol?.toLowerCase().includes(searchLower) ||
        tx.to_symbol?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-primary via-blue-400 to-cyan-400 animate-pulse flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">A</span>
          </div>
          <p className="text-xs text-muted-foreground">Loading transaction history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Transaction History</h2>
        <p className="text-sm text-muted-foreground">View and track all your transactions</p>
      </div>

      {/* Filters */}
      <div className="bg-background border border-border rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Type Filter */}
          <div className="flex-1">
            <label className="text-xs text-muted-foreground mb-1 block">Transaction Type</label>
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'All' },
                { value: 'deposit', label: 'Deposits' },
                { value: 'withdraw', label: 'Withdrawals' },
                { value: 'swap', label: 'Swaps' },
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setFilterType(option.value as FilterType)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    filterType === option.value
                      ? 'bg-primary text-white'
                      : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex-1">
            <label className="text-xs text-muted-foreground mb-1 block">Status</label>
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'All' },
                { value: 'pending', label: 'Pending' },
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' },
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setStatusFilter(option.value as StatusFilter)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    statusFilter === option.value
                      ? 'bg-primary text-white'
                      : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="flex-1">
            <label className="text-xs text-muted-foreground mb-1 block">Search</label>
            <input
              type="text"
              placeholder="Search by crypto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-1.5 text-sm rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-background border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary border-b border-border">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Type</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Details</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Amount</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-8 text-muted-foreground">
                    No transactions found
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="border-b border-border hover:bg-secondary/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedTransaction(tx)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          tx.type === 'deposit' ? 'bg-green-500/10' : tx.type === 'withdraw' ? 'bg-red-500/10' : 'bg-blue-500/10'
                        }`}>
                          <span className="text-sm">
                            {tx.type === 'deposit' ? '↓' : tx.type === 'withdraw' ? '↑' : '↔'}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-foreground capitalize">{tx.type}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-foreground">{getTransactionTitle(tx)}</div>
                      {tx.type === 'swap' && (
                        <div className="text-xs text-muted-foreground">
                          {tx.from_amount} {tx.from_symbol} → {tx.to_amount} {tx.to_symbol}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-foreground">{formatUSD(tx.usd_amount)}</div>
                      {tx.amount && (
                        <div className="text-xs text-muted-foreground">
                          {formatCrypto(tx.amount)} {tx.crypto_symbol}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusBg(tx.status)} ${getStatusColor(tx.status)}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-foreground">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(tx.created_at).toLocaleTimeString()}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <TransactionDetailModal
          isOpen={!!selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          transaction={{
            id: selectedTransaction.id,
            type: selectedTransaction.type,
            sym: selectedTransaction.crypto_symbol,
            amount: selectedTransaction.amount,
            usd: selectedTransaction.usd_amount,
            date: new Date(selectedTransaction.created_at).toLocaleDateString(),
            time: new Date(selectedTransaction.created_at).toLocaleTimeString(),
            status: selectedTransaction.status,
            from: selectedTransaction.from_symbol,
            to: selectedTransaction.to_symbol,
            adminNotes: selectedTransaction.admin_notes,
          }}
        />
      )}
    </div>
  );
}