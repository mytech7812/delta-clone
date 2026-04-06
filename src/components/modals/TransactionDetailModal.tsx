import { Modal } from './Modal';
import { formatUSD, formatCrypto } from '@/lib/utils';
import { CIcon } from '@/components/CIcon';

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: {
    id: number;
    type: 'deposit' | 'withdraw' | 'swap';
    sym?: string;
    amount?: number;
    usd: number;
    date: string;
    time?: string;
    status: 'pending' | 'approved' | 'rejected';
    from?: string;
    to?: string;
    txHash?: string;
    adminNotes?: string;
    approvedAt?: string;
  };
}

export function TransactionDetailModal({ isOpen, onClose, transaction }: TransactionDetailModalProps) {
  if (!isOpen) return null;

  const getStatusColor = () => {
    switch (transaction.status) {
      case 'approved': return '#10b981';
      case 'rejected': return '#ef4444';
      default: return '#f59e0b';
    }
  };

  const getStatusBg = () => {
    switch (transaction.status) {
      case 'approved': return 'rgba(16,185,129,0.1)';
      case 'rejected': return 'rgba(239,68,68,0.1)';
      default: return 'rgba(245,158,11,0.1)';
    }
  };

  const getStatusText = () => {
    switch (transaction.status) {
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return 'Pending';
    }
  };

  const getIcon = () => {
    if (transaction.type === 'deposit') return '↓';
    if (transaction.type === 'withdraw') return '↑';
    return '↔';
  };

  const getTitle = () => {
    if (transaction.type === 'deposit') return `Deposit ${transaction.sym}`;
    if (transaction.type === 'withdraw') return `Withdraw ${transaction.sym}`;
    return `Swap ${transaction.from} → ${transaction.to}`;
  };

  return (
    <Modal title="Transaction Details" onClose={onClose}>
      <div style={{ padding: '8px 0' }}>
        {/* Status Badge */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 16px',
              borderRadius: 20,
              background: getStatusBg(),
              color: getStatusColor(),
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: getStatusColor(),
                display: 'inline-block',
              }}
            />
            {getStatusText()}
          </div>
        </div>

        {/* Transaction Icon & Type */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: transaction.type === 'deposit' ? 'rgba(16,185,129,0.1)' : transaction.type === 'withdraw' ? 'rgba(239,68,68,0.1)' : 'rgba(99,102,241,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              margin: '0 auto 12px',
            }}
          >
            {getIcon()}
          </div>
          <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {getTitle()}
          </div>
          <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4 }}>
            Transaction ID: #{transaction.id}
          </div>
        </div>

        {/* Transaction Details Card */}
        <div
          style={{
            background: 'var(--color-background-secondary)',
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Amount</span>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {transaction.amount ? formatCrypto(transaction.amount) : ''} {transaction.sym || transaction.to}
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                {formatUSD(transaction.usd)}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Date & Time</span>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 14, color: 'var(--color-text-primary)' }}>{transaction.date}</div>
              {transaction.time && (
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{transaction.time}</div>
              )}
            </div>
          </div>

          {transaction.txHash && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Transaction Hash</span>
              <div style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--color-text-primary)', textAlign: 'right', wordBreak: 'break-all' }}>
                {transaction.txHash.slice(0, 20)}...
              </div>
            </div>
          )}

          {transaction.approvedAt && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Processed At</span>
              <div style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>
                {transaction.approvedAt}
              </div>
            </div>
          )}
        </div>

        {/* Admin Notes (if any) */}
        {transaction.adminNotes && (
          <div
            style={{
              background: 'rgba(245,158,11,0.08)',
              borderRadius: 12,
              padding: 12,
              marginBottom: 16,
              border: '1px solid rgba(245,158,11,0.2)',
            }}
          >
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Admin Note</div>
            <div style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>{transaction.adminNotes}</div>
          </div>
        )}

        {/* Status Message */}
        {transaction.status === 'pending' && (
          <div
            style={{
              background: 'rgba(245,158,11,0.08)',
              borderRadius: 12,
              padding: 12,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 13, color: 'var(--color-text-warning)' }}>
              ⏳ Your transaction is being processed
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 4 }}>
              Deposits typically take 1-30 minutes to confirm
            </div>
          </div>
        )}

        {transaction.status === 'approved' && (
          <div
            style={{
              background: 'rgba(16,185,129,0.08)',
              borderRadius: 12,
              padding: 12,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 13, color: 'var(--color-text-success)' }}>
              ✓ Transaction completed successfully
            </div>
          </div>
        )}

        {transaction.status === 'rejected' && (
          <div
            style={{
              background: 'rgba(239,68,68,0.08)',
              borderRadius: 12,
              padding: 12,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 13, color: 'var(--color-text-danger)' }}>
              ✗ Transaction was rejected
            </div>
            {transaction.adminNotes && (
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                Reason: {transaction.adminNotes}
              </div>
            )}
          </div>
        )}

        <button
          onClick={onClose}
          className="primary-btn"
          style={{ marginTop: 16 }}
        >
          Close
        </button>
      </div>
    </Modal>
  );
}