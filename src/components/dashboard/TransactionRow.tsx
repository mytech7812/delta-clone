import { formatUSD, formatCrypto } from '@/lib/utils';

interface Transaction {
  id: number;
  type: string;
  sym?: string;
  amt?: number;
  usd: number;
  date: string;
  from?: string;
  to?: string;
  status?: 'pending' | 'approved' | 'rejected';
  txHash?: string;
  adminNotes?: string;
  approvedAt?: string;
}

interface TransactionRowProps {
  tx: Transaction;
  onClick: (tx: Transaction) => void;
}

export function TransactionRow({ tx, onClick }: TransactionRowProps) {
  const getIcon = () => {
    if (tx.type === 'deposit') return '↓';
    if (tx.type === 'withdraw') return '↑';
    return '↔';
  };

  const getIconBg = () => {
    if (tx.type === 'deposit') return 'rgba(16,185,129,0.1)';
    if (tx.type === 'withdraw') return 'rgba(239,68,68,0.1)';
    return 'rgba(99,102,241,0.1)';
  };

  const getTitle = () => {
    if (tx.type === 'deposit') return `Deposited ${tx.sym}`;
    if (tx.type === 'withdraw') return `Withdrew ${tx.sym}`;
    return `Swapped ${tx.from} → ${tx.to}`;
  };

  const getAmountColor = () => {
    if (tx.type === 'deposit') return 'var(--color-text-success)';
    if (tx.type === 'withdraw') return 'var(--color-text-danger)';
    return 'var(--color-text-primary)';
  };

  const getAmountSign = () => {
    if (tx.type === 'deposit') return '+';
    if (tx.type === 'withdraw') return '-';
    return '';
  };

  const getSubText = () => {
    if (tx.type === 'swap') return `${tx.from} → ${tx.to}`;
    return `${formatCrypto(tx.amt || 0)} ${tx.sym}`;
  };

  const getStatusColor = () => {
    if (tx.status === 'approved') return '#10b981';
    if (tx.status === 'rejected') return '#ef4444';
    return '#f59e0b';
  };

  return (
    <div 
      className="txn-row" 
      onClick={() => onClick(tx)}
      style={{ cursor: 'pointer' }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          flexShrink: 0,
          background: getIconBg(),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16,
        }}
      >
        {getIcon()}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>
          {getTitle()}
        </div>
        <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{tx.date}</div>
        {tx.status && tx.status !== 'approved' && (
          <div style={{ fontSize: 10, color: getStatusColor(), marginTop: 2 }}>
            {tx.status === 'pending' ? '⏳ Pending' : tx.status === 'rejected' ? '✗ Rejected' : '✓ Approved'}
          </div>
        )}
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: getAmountColor() }}>
          {getAmountSign()}{formatUSD(tx.usd)}
        </div>
        <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{getSubText()}</div>
      </div>
    </div>
  );
}