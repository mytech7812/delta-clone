import { formatUSD, formatCrypto, getCrypto } from '@/lib/utils';
import { CIcon } from '@/components/CIcon';
import { getCryptoIcon } from '@/lib/cryptoIcons';
import { Modal } from './Modal';

interface CryptoModalProps {
  sym: string;
  holding: number;
  price: number;
  priceChange: number;
  onClose: () => void;
  onConvert: (sym: string) => void;
  onWithdraw: (sym: string) => void;
  onReceive: (sym: string) => void;
}

export function CryptoModal({
  sym,
  holding,
  price,
  priceChange,
  onClose,
  onConvert,
  onWithdraw,
  onReceive,
}: CryptoModalProps) {
  const crypto = getCrypto(sym);
  const usdValue = holding * price;
  const isPositive = priceChange >= 0;

  return (
    <Modal title={crypto.name} onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 8, marginBottom: 20 }}>
        {getCryptoIcon(sym, 56)}

        <div>
          <div style={{ fontSize: 22, fontWeight: 500, color: 'var(--color-text-primary)' }}>
            {formatUSD(price)}
          </div>
          <div
            style={{
              fontSize: 13,
              color: isPositive ? 'var(--color-text-success)' : 'var(--color-text-danger)',
              marginTop: 2,
            }}
          >
            {isPositive ? '▲' : '▼'} {Math.abs(priceChange).toFixed(2)}% (24h)
          </div>
        </div>
      </div>

      {holding > 0 && (
        <div
          style={{
            background: 'var(--color-background-secondary)',
            borderRadius: 12,
            padding: 14,
            marginBottom: 16,
            border: '0.5px solid var(--color-border-tertiary)',
          }}
        >
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
            Your balance
          </div>
          <div style={{ fontSize: 20, fontWeight: 500, color: 'var(--color-text-primary)' }}>
            {formatUSD(usdValue)}
          </div>
          <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 2 }}>
            {formatCrypto(holding)} {sym}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        {[
          { label: 'Withdraw', color: '#ef4444', onClick: () => onWithdraw(sym) },
          { label: 'Receive', color: '#10b981', onClick: () => onReceive(sym) },
          { label: 'Convert', color: '#0099ff', onClick: () => onConvert(sym) },
        ].map(({ label, color, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            style={{
              padding: '14px 0',
              borderRadius: 12,
              background: `${color}18`,
              border: `1px solid ${color}35`,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 7,
              transition: 'background 0.15s',
            }}
          >
            <span style={{ fontSize: 16 }}>{label === 'Withdraw' ? '↑' : label === 'Receive' ? '↓' : '↔'}</span>
            <span style={{ color, fontSize: 12, fontWeight: 500 }}>{label}</span>
          </button>
        ))}
      </div>
    </Modal>
  );
}