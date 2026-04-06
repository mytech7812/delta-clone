import { Modal } from './Modal';
import { CIcon } from '@/components/CIcon';
import { formatCrypto, formatUSD } from '@/lib/utils';

interface DepositConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  depositDetails: {
    cryptoSymbol: string;
    amount: number;
    usdAmount: number;
    adminWallet: string;
    date: string;
    time: string;
  };
}

export function DepositConfirmationModal({ isOpen, onClose, depositDetails }: DepositConfirmationModalProps) {
  if (!isOpen) return null;

  const truncatedWallet = `${depositDetails.adminWallet.slice(0, 12)}...${depositDetails.adminWallet.slice(-8)}`;

  return (
    <Modal title="Deposit Underway" onClose={onClose}>
      <div style={{ textAlign: 'center', padding: '8px 0' }}>
        {/* Success Animation */}
        <div
          style={{
            width: 64,
            height: 64,
            margin: '0 auto 20px',
            background: 'rgba(16, 185, 129, 0.15)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              background: 'var(--color-text-success)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              color: '#fff',
            }}
          >
            ✓
          </div>
        </div>

        <h3
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            marginBottom: 8,
          }}
        >
          Deposit Request Submitted
        </h3>
        <p
          style={{
            fontSize: 13,
            color: 'var(--color-text-secondary)',
            marginBottom: 24,
          }}
        >
          Your deposit is being processed
        </p>

        {/* Deposit Details Card */}
        <div
          style={{
            background: 'var(--color-background-secondary)',
            borderRadius: 16,
            padding: 16,
            marginBottom: 20,
            textAlign: 'left',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 16,
              paddingBottom: 12,
              borderBottom: '1px solid var(--color-border-tertiary)',
            }}
          >
            <CIcon sym={depositDetails.cryptoSymbol} size={40} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {depositDetails.cryptoSymbol}
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                {formatCrypto(depositDetails.amount)} {depositDetails.cryptoSymbol}
              </div>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {formatUSD(depositDetails.usdAmount)}
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>USD Value</div>
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
              Sent to Wallet
            </div>
            <div
              style={{
                fontSize: 12,
                fontFamily: 'monospace',
                color: 'var(--color-text-primary)',
                background: 'var(--color-background-primary)',
                padding: '6px 10px',
                borderRadius: 8,
                wordBreak: 'break-all',
              }}
            >
              {truncatedWallet}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                Date
              </div>
              <div style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>
                {depositDetails.date}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                Time
              </div>
              <div style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>
                {depositDetails.time}
              </div>
            </div>
          </div>

          <div
            style={{
              background: 'rgba(245, 158, 11, 0.1)',
              borderRadius: 10,
              padding: '10px 12px',
              marginTop: 8,
            }}
          >
            <div style={{ fontSize: 11, color: 'var(--color-text-warning)' }}>
              ⏳ Deposit typically takes 1-30 minutes depending on network congestion
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="primary-btn"
          style={{ background: 'var(--brand)' }}
        >
          Got it, I'll wait
        </button>
      </div>
    </Modal>
  );
}