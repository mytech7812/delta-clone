import { useState } from 'react';
import { formatUSD, formatCrypto, getCrypto } from '@/lib/utils';
import { CIcon } from '@/components/CIcon';
import { Modal } from './Modal';
import { toast } from 'sonner';
import { getCryptoIcon } from '@/lib/cryptoIcons';

interface WithdrawModalProps {
  initSym: string | null;
  prices: Record<string, number>;
  holdings: Record<string, number>;
  onClose: () => void;
  onConvert?: (sym: string) => void;
}

// Only these coins are available for withdrawal
const AVAILABLE_WITHDRAWALS = ['USDT', 'USDC', 'ETH', 'BTC'];

export function WithdrawModal({ initSym, prices, holdings, onClose, onConvert }: WithdrawModalProps) {
  const [step, setStep] = useState(1);
  const [sym, setSym] = useState(initSym || '');
  const [amount, setAmount] = useState('');
  // `amount` is USD string input now
  const maxAmount = holdings[sym] || 0; // crypto amount available
  const price = prices[sym] || 0; // USD per crypto
  const maxAmountUSD = maxAmount * price; // USD available
  const usdValue = amount ? formatUSD(parseFloat(amount) || 0) : '';
  const cryptoEquivalent = price > 0 && amount ? (parseFloat(amount) || 0) / price : 0;
  const isAvailable = AVAILABLE_WITHDRAWALS.includes(sym);

  const handleConvert = () => {
    if (onConvert) {
      onConvert(sym);
      onClose();
    } else {
      toast.info(`Convert ${sym} to a supported withdrawal asset`);
    }
  };

  // Filter cryptos that have balance > 0
  const cryptosWithBalance = Object.entries(holdings)
    .filter(([_, balance]) => balance > 0)
    .map(([sym]) => ({ sym, ...getCrypto(sym) }));

  // Step 1: Select cryptocurrency - Only show cryptos with balance
  if (step === 1) {
    // If user has no balance at all
    if (cryptosWithBalance.length === 0) {
      return (
        <Modal title="Withdraw" onClose={onClose}>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>💰</div>
            <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 8 }}>
              No funds available
            </div>
            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 20 }}>
              You don't have any balance to withdraw
            </div>
            <button
              className="primary-btn"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </Modal>
      );
    }

    return (
      <Modal title="Select Cryptocurrency" onClose={onClose}>
        <div style={{ maxHeight: 460, overflowY: 'auto' }}>
          {cryptosWithBalance.map((c) => {
            const balance = holdings[c.sym] || 0;
            const p = prices[c.sym] || 0;
            return (
              <button
                key={c.sym}
                className="list-row"
                onClick={() => {
                  setSym(c.sym);
                  setStep(2);
                }}
              >
                {getCryptoIcon(c.sym, 38)}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                    {c.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                    {c.sym} · Balance: {balance > 0 ? formatUSD((balance || 0) * (p || 0)) : formatUSD(0)}
                  </div>
                </div>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: 18 }}>›</span>
              </button>
            );
          })}
        </div>
      </Modal>
    );
  }

  // Step 2: Withdrawal form
  return (
    <Modal title={`Withdraw ${sym}`} onClose={onClose} onBack={() => setStep(1)}>
      {!isAvailable ? (
        <div
          style={{
            background: 'rgba(245, 158, 11, 0.1)',
            borderRadius: 16,
            padding: 24,
            marginBottom: 20,
            border: '1px solid rgba(245, 158, 11, 0.3)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              background: 'rgba(245, 158, 11, 0.15)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              margin: '0 auto 16px',
            }}
          >
            ⚠️
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-warning)', marginBottom: 8 }}>
            {sym} Withdrawals Unavailable
          </div>
          <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 24 }}>
            {sym} withdrawals are unavailable at this time, convert to USDT to proceed
          </div>
          <button
            onClick={handleConvert}
            style={{
              padding: '12px 24px',
              background: 'var(--brand)',
              border: 'none',
              borderRadius: 12,
              color: '#fff',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Convert to USDT
          </button>
        </div>
      ) : (
        <>
          {/* Balance display */}
          <div
            style={{
              background: 'var(--color-background-secondary)',
              borderRadius: 12,
              padding: 16,
              marginBottom: 20,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
              Available Balance
            </div>
            <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {formatUSD(maxAmountUSD)}
            </div>
            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
              ≈ {maxAmount > 0 ? `${formatCrypto(maxAmount)} ${sym}` : `0 ${sym}`}
            </div>
          </div>

          {/* Amount input */}
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 13,
                color: 'var(--color-text-secondary)',
                marginBottom: 8,
              }}
            >
              <span>Amount to withdraw</span>
              {maxAmount > 0 && (
                <button
                  onClick={() => setAmount(String(maxAmountUSD))}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--brand)',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  Max
                </button>
              )}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'var(--color-background-secondary)',
                border: '1px solid var(--color-border-tertiary)',
                borderRadius: 12,
                padding: '14px 16px',
              }}
            >
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--color-text-primary)',
                  fontSize: 20,
                  fontWeight: 500,
                }}
              />
              <span style={{ color: 'var(--color-text-secondary)', fontSize: 16, fontWeight: 500 }}>$</span>
            </div>
            {amount && (
              <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 8 }}>
                ≈ {formatCrypto(cryptoEquivalent)} {sym}
              </div>
            )}
          </div>

          <div
            style={{
              background: 'rgba(239,68,68,0.06)',
              border: '1px solid rgba(239,68,68,0.15)',
              borderRadius: 10,
              padding: '12px 14px',
              fontSize: 12,
              color: 'var(--color-text-danger)',
              marginBottom: 20,
            }}
          >
            ⏳ Withdrawals are typically processed within 1 business day
          </div>

            <button
              className="primary-btn"
              disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > maxAmountUSD}
              onClick={() => {
                const usd = parseFloat(amount) || 0;
                const cryptoAmt = price > 0 ? usd / price : 0;
                toast.success(`Withdrawal request submitted for ${formatUSD(usd)} (~${formatCrypto(cryptoAmt)} ${sym})`);
                onClose();
              }}
              style={{ background: '#ef4444' }}
            >
            Confirm Withdrawal
          </button>
        </>
      )}
    </Modal>
  );
}