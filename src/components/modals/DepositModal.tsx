import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { CRYPTOS } from '@/lib/constants';
import { formatUSD, formatCrypto, getCrypto } from '@/lib/utils';
import { CIcon } from '@/components/CIcon';
import { Modal } from './Modal';
import { getCryptoIcon } from '@/lib/cryptoIcons';
import { toast } from 'sonner';

interface DepositModalProps {
  prices: Record<string, number>;
  onClose: () => void;
  onDepositSubmit: (deposit: {
    cryptoSymbol: string;
    amount: number;
    usdAmount: number;
    adminWallet: string;
  }) => Promise<void>;
  isSubmitting?: boolean;
}

export function DepositModal({ prices, onClose, onDepositSubmit, isSubmitting = false }: DepositModalProps) {
  const [step, setStep] = useState(1);
  const [selectedSym, setSelectedSym] = useState<string | null>(null);
  const [usdAmount, setUsdAmount] = useState('');
  const [copied, setCopied] = useState(false);
  const [localSubmitting, setLocalSubmitting] = useState(false);
  const [adminWallet, setAdminWallet] = useState('');

  const quickAmounts = [100, 500, 1000, 5000];

  // Fetch wallet address from Supabase when crypto is selected
  useEffect(() => {
    const fetchWalletAddress = async () => {
      if (!selectedSym) return;
      
      const { data, error } = await supabase
        .from('admin_wallets')
        .select('wallet_address')
        .eq('crypto_symbol', selectedSym)
        .single();
      
      if (error) {
        console.error('Error fetching wallet:', error);
        setAdminWallet('Wallet not configured');
      } else {
        setAdminWallet(data?.wallet_address || 'Wallet not configured');
      }
    };
    
    fetchWalletAddress();
  }, [selectedSym]);

  if (step === 1) {
    return (
      <Modal title="Select Cryptocurrency" onClose={onClose}>
        <div style={{ maxHeight: 460, overflowY: 'auto' }}>
          {CRYPTOS.map((c) => (
            <button
              key={c.sym}
              className="list-row"
              onClick={() => {
                setSelectedSym(c.sym);
                setStep(2);
              }}
            >
             {getCryptoIcon(c.sym, 38)}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                  {c.name}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                  {c.sym} · {formatUSD(prices[c.sym] || 0)}
                </div>
              </div>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: 18 }}>›</span>
            </button>
          ))}
        </div>
      </Modal>
    );
  }

  const price = prices[selectedSym!] || 0;
  const cryptoAmount = usdAmount ? (parseFloat(usdAmount) || 0) / price : 0;

  const copyAddress = () => {
    navigator.clipboard.writeText(adminWallet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Wallet address copied!');
  };

  const handleConfirmDeposit = async () => {
    if (!selectedSym || !usdAmount) return;
    
    setLocalSubmitting(true);
    
    await onDepositSubmit({
      cryptoSymbol: selectedSym,
      amount: cryptoAmount,
      usdAmount: parseFloat(usdAmount),
      adminWallet: adminWallet,
    });
    
    setLocalSubmitting(false);
    onClose();
  };

  const isButtonDisabled = localSubmitting || isSubmitting || !usdAmount || parseFloat(usdAmount) <= 0;

  return (
    <Modal title={`Deposit ${selectedSym}`} onClose={onClose} onBack={() => setStep(1)}>
      <div style={{ display: 'flex', justifyContent: 'center', margin: '12px 0 20px' }}>
        {getCryptoIcon(selectedSym!, 64)}
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
          Amount (USD)
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--color-background-secondary)',
            border: '1px solid var(--color-border-tertiary)',
            borderRadius: 12,
            padding: '12px 16px',
          }}
        >
          <span style={{ color: 'var(--color-text-secondary)', fontSize: 20 }}>$</span>
          <input
            type="number"
            placeholder="0.00"
            value={usdAmount}
            onChange={(e) => setUsdAmount(e.target.value)}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              color: 'var(--color-text-primary)',
              fontSize: 22,
              fontWeight: 500,
            }}
          />
        </div>
        {usdAmount && (
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 5 }}>
            ≈ {formatCrypto(cryptoAmount)} {selectedSym}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 18 }}>
        {quickAmounts.map((q) => (
          <button
            key={q}
            className={`tag-btn${usdAmount === String(q) ? ' active' : ''}`}
            onClick={() => setUsdAmount(String(q))}
          >
            ${q}
          </button>
        ))}
      </div>

      {usdAmount && parseFloat(usdAmount) > 0 && (
        <>
          <div
            style={{
              background: 'rgba(0,153,255,0.08)',
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              border: '1px solid rgba(0,153,255,0.2)',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 12 }}>
              Send exactly:
            </div>
            <div
              style={{
                background: 'var(--color-background-primary)',
                padding: 12,
                borderRadius: 8,
                marginBottom: 12,
                border: '1px solid var(--color-border-tertiary)',
              }}
            >
              <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                Amount to send
              </div>
              <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {formatCrypto(cryptoAmount)} {selectedSym}
              </div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 8 }}>
              To this wallet address:
            </div>
            <div
              style={{
                background: 'var(--color-background-secondary)',
                padding: 12,
                borderRadius: 8,
                wordBreak: 'break-all',
                fontFamily: 'monospace',
                fontSize: 12,
                marginBottom: 8,
              }}
            >
              {adminWallet}
            </div>
            <button
              onClick={copyAddress}
              style={{
                width: '100%',
                padding: 8,
                background: 'var(--brand)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {copied ? '✓ Copied!' : 'Copy Wallet Address'}
            </button>
            <div
              style={{
                marginTop: 12,
                fontSize: 11,
                color: 'var(--color-text-warning)',
                textAlign: 'center',
              }}
            >
              ⚠️ Send ONLY {selectedSym} to this address. Other assets will be lost.
            </div>
          </div>

          <button
            className="primary-btn"
            onClick={handleConfirmDeposit}
            disabled={isButtonDisabled}
            style={{
              opacity: isButtonDisabled ? 0.6 : 1,
              cursor: isButtonDisabled ? 'not-allowed' : 'pointer',
            }}
          >
            {localSubmitting ? 'Processing... (5 sec)' : 'I\'ve Sent the Payment'}
          </button>
        </>
      )}
    </Modal>
  );
}