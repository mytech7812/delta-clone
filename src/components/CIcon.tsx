import { getCrypto } from '@/lib/utils';

interface CIconProps {
  sym: string;
  size?: number;
}

export function CIcon({ sym, size = 40 }: CIconProps) {
  const crypto = getCrypto(sym);
  
  return (
    <div
      style={{
        width: size,
        height: size,
        background: `${crypto.color}18`,
        border: `1.5px solid ${crypto.color}40`,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: crypto.color,
        fontSize: size * 0.36,
        fontWeight: 500,
        flexShrink: 0,
        userSelect: 'none'
      }}
    >
      {crypto.icon}
    </div>
  );
}