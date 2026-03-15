import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

export default function TrendBadge({ value, suffix = '%', label = 'vs mois dernier' }) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return null;

    const v = Number(value);
    const positive = v > 0;
    const negative = v < 0;

    const color = positive ? '#22c55e' : negative ? '#ef4444' : 'var(--color-muted)';
    const bg = positive ? 'rgba(34,197,94,0.12)' : negative ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.06)';
    const border = positive ? 'rgba(34,197,94,0.25)' : negative ? 'rgba(239,68,68,0.25)' : 'var(--color-border)';

    const Icon = positive ? ArrowUpRight : negative ? ArrowDownRight : Minus;

    return (
        <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 10px',
            borderRadius: 999,
            border: `1px solid ${border}`,
            background: bg,
            color,
            fontSize: '0.72rem',
            fontWeight: 700,
            lineHeight: 1,
            whiteSpace: 'nowrap',
        }}>
            <Icon size={14} />
            <span>{(positive ? '+' : '') + v.toFixed(0)}{suffix}</span>
            <span style={{ color: 'var(--color-muted)', fontWeight: 600, marginLeft: 6 }}>{label}</span>
        </div>
    );
}
