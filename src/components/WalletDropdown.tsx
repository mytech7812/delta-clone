import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useState } from 'react';

interface WalletDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (walletId: string) => void;
  wallets: Array<{ id: string; name: string; icon: any }>;
  selectedWalletId?: string;
  triggerRef: React.RefObject<HTMLElement>;
  renderIcon: (icon: any, size: number) => React.ReactNode;
}

export function WalletDropdown({ isOpen, onClose, onSelect, wallets, triggerRef, renderIcon }: WalletDropdownProps) {
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [isOpen, triggerRef]);

  if (!isOpen) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        style={{
          position: 'absolute',
          top: position.top,
          left: position.left,
          width: position.width,
          background: 'var(--color-background-primary)',
          border: '1px solid var(--color-border-tertiary)',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          zIndex: 9999,
          maxHeight: '300px',
          overflowY: 'auto',
        }}
      >
        {wallets.map((wallet) => (
          <button
            key={wallet.id}
            onClick={() => {
              onSelect(wallet.id);
              onClose();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              width: '100%',
              background: 'transparent',
              border: 'none',
              borderBottom: '1px solid var(--color-border-tertiary)',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            {renderIcon(wallet.icon, 24)}
            <span style={{ color: 'var(--color-text-primary)', fontSize: '14px' }}>{wallet.name}</span>
          </button>
        ))}
      </div>
    </>,
    document.body
  );
}