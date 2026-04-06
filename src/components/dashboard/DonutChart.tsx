import { formatUSD, getSortedHoldings } from '@/lib/utils';

interface DonutChartProps {
  holdings: Record<string, number>;
  prices: Record<string, number>;
  size?: number;
  change?: number;
  centerLabel?: string;
}

export function DonutChart({ holdings, prices, size = 190, change = 0, centerLabel }: DonutChartProps) {
  const total = getSortedHoldings(holdings, prices).reduce((sum, item) => sum + item.usd, 0);
  const items = getSortedHoldings(holdings, prices);
  const isPositive = change >= 0;
  
  const T = 30;
  const r = (size - T) / 2;
  const C = 2 * Math.PI * r;
  const cx = size / 2;
  const cy = size / 2;
  
  let cumA = 0;
  const segs = items.map(item => {
    const pct = item.usd / total;
    const dash = Math.max(3, pct * C - 4);
    const rot = cumA - 90;
    cumA += pct * 360;
    return { ...item, dash, rot, color: item.crypto.color };
  });

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size}>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="rgba(128,128,128,0.08)"
          strokeWidth={T}
        />
        {segs.map((s, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={T - 8}
            strokeDasharray={`${s.dash} ${C - s.dash}`}
            transform={`rotate(${s.rot} ${cx} ${cy})`}
          />
        ))}
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          pointerEvents: 'none'
        }}
      >
        <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{centerLabel || 'Portfolio'}</div>
        <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--color-text-primary)' }}>
          {formatUSD(total)}
        </div>
        <div style={{ fontSize: 11, color: isPositive ? 'var(--color-text-success)' : 'var(--color-text-danger)' }}>
          {isPositive ? '▲' : '▼'} {Math.abs(change).toFixed(2)}% (24h)
        </div>
      </div>
    </div>
  );
}