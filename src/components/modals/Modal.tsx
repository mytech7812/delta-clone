import React from 'react';

interface ModalProps {
  title: string;
  onClose: () => void;
  onBack?: () => void;
  children: React.ReactNode;
}

export function Modal({ title, onClose, onBack, children }: ModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle">
          <div />
        </div>
        <div className="modal-header">
          {onBack && (
            <button className="icon-btn" onClick={onBack} style={{ marginRight: 8 }}>
              ‹
            </button>
          )}
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose}>
            ×
          </button>
        </div>
        <div style={{ padding: '0 20px 24px' }}>{children}</div>
      </div>
    </div>
  );
}