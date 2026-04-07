import { formatUSD, formatCrypto, getCrypto } from '@/lib/utils';
import { CIcon } from '@/components/CIcon';
import { TokenBTC, TokenETH, TokenSOL, TokenUSDT, TokenBNB, TokenXRP, TokenADA } from '@web3icons/react';

interface CryptoCardProps {
  sym: string;
  price: number;
  holding?: number;
  onClick: () => void;
}

const getCryptoIcon = (sym: string, size: number) => {
  const iconProps = { size, variant: 'branded' as const };
  switch(sym) {
    case 'BTC': return <TokenBTC {...iconProps} />;
    case 'ETH': return <TokenETH {...iconProps} />;
    case 'SOL': return <TokenSOL {...iconProps} />;
    case 'USDT': return <TokenUSDT {...iconProps} />;
    case 'BNB': return <TokenBNB {...iconProps} />;
    case 'XRP': return <TokenXRP {...iconProps} />;
    case 'ADA': return <TokenADA {...iconProps} />;
    default: return <CIcon sym={sym} size={size} />;
  }
};

export function CryptoCard({ sym, price, holding = 0, onClick }: CryptoCardProps) {
  const crypto = getCrypto(sym);
  const usdValue = holding * price;

  return (
    <button className="crypto-card" onClick={onClick}>
      {getCryptoIcon(sym, 36)}
      <div style={{ marginTop: 10, fontWeight: 600, fontSize: 14, color: 'var(--color-text-primary)' }}>
        {sym}
      </div>
      <div style={{ color: 'var(--color-text-secondary)', fontSize: 12, marginBottom: 6 }}>
        {crypto.name}
      </div>
      <div style={{ fontWeight: 500, fontSize: 11, color: 'var(--color-text-secondary)' }}>
        {formatUSD(price)}
      </div>

      <div style={{ marginTop: 10, paddingTop: 10, borderTop: '0.5px solid var(--color-border-tertiary)' }}>
        <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 6 }}>{sym} Wallet</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1 }}>
          {formatUSD(usdValue)}
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>
          {formatCrypto(holding)} {sym}
        </div>
      </div>
    </button>
  );
}