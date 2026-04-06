import { useState } from 'react';
import { CRYPTOS } from '@/lib/constants';
import { formatUSD, getCrypto } from '@/lib/utils';
import { CIcon } from '@/components/CIcon';
import { Modal } from './Modal';

interface AllCryptosModalProps {
  prices: Record<string, number>;
  onClose: () => void;
  onSelect: (sym: string) => void;
}

export function AllCryptosModal({ prices, onClose, onSelect }: AllCryptosModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredCryptos = CRYPTOS.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.sym.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal title={`All Cryptocurrencies `} onClose={onClose}>
      <div className="search-bar">
        <span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>🔍</span>
        <input
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            background: 'none',
            border: 'none',
            outline: 'none',
            color: 'var(--color-text-primary)',
            fontSize: 14,
            flex: 1,
          }}
        />
      </div>
      <div style={{ maxHeight: 400, overflowY: 'auto' }}>
        {filteredCryptos.map((c) => {
          const price = prices[c.sym] || 0;
          return (
            <button
              key={c.sym}
              className="list-row"
              onClick={() => onSelect(c.sym)}
            >
              <CIcon sym={c.sym} size={38} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                  {c.name}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{c.sym}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                  {formatUSD(price)}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: c.chg >= 0 ? 'var(--color-text-success)' : 'var(--color-text-danger)',
                  }}
                >
                  {c.chg >= 0 ? '+' : ''}{c.chg}%
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}