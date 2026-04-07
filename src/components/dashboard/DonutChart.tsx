import { formatUSD, getSortedHoldings } from '@/lib/utils';

interface DonutChartProps {
  holdings: Record<string, number>;
  prices: Record<string, number>;
  size?: number;
  change?: number;
  total?: number;
}

export function DonutChart({ holdings, prices, size = 200, change = 0, total: propTotal }: DonutChartProps) {
  const items = getSortedHoldings(holdings, prices);
  const total = propTotal !== undefined ? propTotal : items.reduce((sum, item) => sum + item.usd, 0);
  const isPositive = change >= 0;
  
  const T = 12; // Thinner ring (was 30)
  const r = (size - T) / 2;
  const C = 2 * Math.PI * r;
  const cx = size / 2;
  const cy = size / 2;
  
  let cumA = 0;
  const segs = items.map(item => {
    const pct = item.usd / total;
    const dash = Math.max(2, pct * C - 2);
    const rot = cumA - 90;
    cumA += pct * 360;
    return { ...item, dash, rot, color: item.crypto.color };
  });

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size}>
        {/* Background ring */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="var(--color-background-secondary)"
          strokeWidth={T}
        />
        {/* Segments */}
        {segs.map((s, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={T}
            strokeDasharray={`${s.dash} ${C - s.dash}`}
            strokeDashoffset="0"
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
          gap: '4px',
          pointerEvents: 'none'
        }}
      >
        <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Total balance</div>
        <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
          {formatUSD(total)}
        </div>
        <div style={{ fontSize: '11px', color: isPositive ? 'var(--color-text-success)' : 'var(--color-text-danger)' }}>
          {isPositive ? '▲' : '▼'} {Math.abs(change).toFixed(2)}% (24h)
        </div>
      </div>
    </div>
  );
}