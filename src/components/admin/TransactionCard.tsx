import { formatUSD, formatCrypto } from '@/lib/utils';
type TransactionStatus = 'pending' | 'approved' | 'rejected';
type TransactionType = 'deposit' | 'withdraw' | 'swap';

interface TransactionCardProps {
  transaction: {
    id: number;
    type: TransactionType;
    userEmail?: string;
    userName?: string;
    sym?: string;
    amount?: number;
    usd: number;
    date: string;
    time?: string;
    status: TransactionStatus;
    txHash?: string;
    from?: string;
    to?: string;
  };
  onUpdateStatus: (id: number, status: 'approved' | 'rejected') => void;
}

export function TransactionCard({ transaction, onUpdateStatus }: TransactionCardProps) {
  const getStatusColor = () => {
    switch (transaction.status) {
      case 'approved': return 'var(--color-text-success)';
      case 'rejected': return 'var(--color-text-danger)';
      default: return 'var(--color-text-warning)';
    }
  };

  const getStatusBg = () => {
    switch (transaction.status) {
      case 'approved': return 'rgba(16,185,129,0.15)';
      case 'rejected': return 'rgba(239,68,68,0.15)';
      default: return 'rgba(245,158,11,0.15)';
    }
  };

  const getIcon = () => {
    if (transaction.type === 'deposit') return '↓';
    if (transaction.type === 'withdraw') return '↑';
    return '↔';
  };

  const getIconBg = () => {
    if (transaction.type === 'deposit') return 'rgba(16,185,129,0.1)';
    if (transaction.type === 'withdraw') return 'rgba(239,68,68,0.1)';
    return 'rgba(99,102,241,0.1)';
  };

  const getTitle = () => {
    if (transaction.type === 'deposit') return `Deposit ${transaction.sym}`;
    if (transaction.type === 'withdraw') return `Withdraw ${transaction.sym}`;
    return `Swap ${transaction.from} → ${transaction.to}`;
  };

  return (
    <div
      style={{
        background: 'var(--color-background-primary)',
        border: `1px solid ${transaction.status === 'pending' ? 'rgba(245,158,11,0.3)' : 'var(--color-border-tertiary)'}`,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: getIconBg(),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
          }}
        >
          {getIcon()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {getTitle()}
          </div>
          {transaction.userEmail && (
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
              {transaction.userName || transaction.userEmail}
            </div>
          )}
        </div>
        <div
          style={{
            padding: '4px 10px',
            borderRadius: 20,
            fontSize: 11,
            background: getStatusBg(),
            color: getStatusColor(),
          }}
        >
          {transaction.status.toUpperCase()}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Amount</div>
<div style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text-primary)' }}>
  {transaction.amount ? formatCrypto(transaction.amount) : '0'} {transaction.sym || transaction.to}
</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>USD Value</div>
          <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text-primary)' }}>
            {formatUSD(transaction.usd)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Date</div>
          <div style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>
            {transaction.date}
          </div>
        </div>
      </div>

      {transaction.status === 'pending' && (
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button
            onClick={() => onUpdateStatus(transaction.id, 'approved')}
            style={{
              flex: 1,
              padding: '8px',
              background: 'rgba(16,185,129,0.15)',
              border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: 8,
              color: 'var(--color-text-success)',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            ✓ Approve
          </button>
          <button
            onClick={() => onUpdateStatus(transaction.id, 'rejected')}
            style={{
              flex: 1,
              padding: '8px',
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 8,
              color: 'var(--color-text-danger)',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            ✗ Reject
          </button>
        </div>
      )}
    </div>
  );
}