import { useState } from 'react';
import { CRYPTOS } from '@/lib/constants';
import { formatUSD, formatCrypto, getCrypto } from '@/lib/utils';
import { CIcon } from '@/components/CIcon';
import { getCryptoIcon } from '@/lib/cryptoIcons';
import { Modal } from './Modal';

interface SwapModalProps {
  initFrom: string;
  initTo: string;
  prices: Record<string, number>;
  holdings: Record<string, number>;
  onClose: () => void;
}

export function SwapModal({ initFrom, initTo, prices, holdings, onClose }: SwapModalProps) {
  const [from, setFrom] = useState(initFrom);
  const [to, setTo] = useState(initTo === initFrom ? 'ETH' : initTo);
  const [amount, setAmount] = useState('');

  const rate = prices[from] && prices[to] ? (prices[from] / prices[to]).toFixed(6) : '—';
  const receiveAmount = amount && prices[from] && prices[to]
    ? ((parseFloat(amount) || 0) * prices[from] / prices[to]).toFixed(6)
    : '';
  const usdValue = amount ? formatUSD((parseFloat(amount) || 0) * prices[from]) : '';

  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  return (
    <Modal title="Convert / Swap" onClose={onClose}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 6 }}>From</div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'var(--color-background-secondary)',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: 12,
            padding: '12px 14px',
          }}
        >
          {getCryptoIcon(from, 34)}
          <select
            className="sel"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            style={{ flex: 1, padding: 0, border: 'none', background: 'none' }}
          >
            {CRYPTOS.map((c) => (
              <option key={c.sym} value={c.sym}>
                {c.sym} — {c.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{
              background: 'none',
              border: 'none',
              outline: 'none',
              color: 'var(--color-text-primary)',
              fontSize: 18,
              fontWeight: 500,
              textAlign: 'right',
              width: 90,
            }}
          />
        </div>
        {(holdings[from] || 0) > 0 && (
          <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 5, textAlign: 'right' }}>
            Balance: {formatCrypto(holdings[from])} {from}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
        <button
          onClick={handleSwap}
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: '0.5px solid var(--brand)',
            background: 'var(--brand-bg)',
            cursor: 'pointer',
            fontSize: 16,
            color: 'var(--brand)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ↕
        </button>
      </div>

      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 6 }}>To</div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'var(--color-background-secondary)',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: 12,
            padding: '12px 14px',
          }}
        >
          {getCryptoIcon(to, 34)}
          <select
            className="sel"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            style={{ flex: 1, padding: 0, border: 'none', background: 'none' }}
          >
            {CRYPTOS.filter((c) => c.sym !== from).map((c) => (
              <option key={c.sym} value={c.sym}>
                {c.sym} — {c.name}
              </option>
            ))}
          </select>
          <div
            style={{
              color: 'var(--color-text-secondary)',
              fontSize: 16,
              fontWeight: 500,
              minWidth: 90,
              textAlign: 'right',
            }}
          >
            {receiveAmount || '0.00'}
          </div>
        </div>
      </div>

      {amount && (
        <div
          style={{
            background: 'var(--color-background-secondary)',
            borderRadius: 10,
            padding: 12,
            marginBottom: 16,
            border: '0.5px solid var(--color-border-tertiary)',
            fontSize: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Rate</span>
            <span style={{ color: 'var(--color-text-primary)' }}>1 {from} = {rate} {to}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>You send</span>
            <span style={{ color: 'var(--color-text-primary)' }}>{amount} {from} ≈ {usdValue}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>You receive</span>
            <span style={{ color: 'var(--color-text-success)' }}>{receiveAmount} {to}</span>
          </div>
        </div>
      )}

      <button
        className="primary-btn"
        disabled={!amount || parseFloat(amount) <= 0}
        onClick={onClose}
      >
        Preview Swap
      </button>
    </Modal>
  );
}