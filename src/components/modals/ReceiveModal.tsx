import { useState } from 'react';
import { CIcon } from '@/components/CIcon';
import { Modal } from './Modal';

interface ReceiveModalProps {
  sym: string;
  onClose: () => void;
}

export function ReceiveModal({ sym, onClose }: ReceiveModalProps) {
  const [copied, setCopied] = useState(false);
  const address = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh';

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal title={`Receive ${sym}`} onClose={onClose}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <CIcon sym={sym} size={60} />
        </div>

        <div
          style={{
            width: 160,
            height: 160,
            margin: '0 auto 16px',
            background: '#fff',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 8,
            border: '0.5px solid var(--color-border-tertiary)',
          }}
        >
          <div style={{ fontSize: 32, color: '#333' }}>[QR]</div>
          <div style={{ fontSize: 11, color: '#666' }}>{sym} Address</div>
        </div>

        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 10 }}>
          Your deposit address
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--color-background-secondary)',
            borderRadius: 10,
            padding: '10px 14px',
            marginBottom: 14,
          }}
        >
          <span
            style={{
              flex: 1,
              fontSize: 11,
              color: 'var(--color-text-primary)',
              fontFamily: 'monospace',
              wordBreak: 'break-all',
              textAlign: 'left',
            }}
          >
            {address}
          </span>
          <button
            onClick={copyAddress}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: copied ? 'var(--color-text-success)' : 'var(--color-text-secondary)',
              flexShrink: 0,
              fontSize: 14,
            }}
          >
            {copied ? '✓' : '⧉'}
          </button>
        </div>

        <div
          style={{
            background: 'rgba(245,158,11,0.08)',
            border: '0.5px solid rgba(245,158,11,0.25)',
            borderRadius: 10,
            padding: '10px 14px',
            fontSize: 12,
            color: 'var(--color-text-warning)',
            textAlign: 'left',
          }}
        >
          Only send {sym} to this address. Sending other assets may result in permanent loss.
        </div>
      </div>
    </Modal>
  );
}