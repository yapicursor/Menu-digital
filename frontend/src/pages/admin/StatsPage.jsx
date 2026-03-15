import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    Legend,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
} from 'recharts';
import AdminLayout from '../../layouts/AdminLayout';
import { orderService } from '../../services/orderService';
import TrendBadge from '../../components/TrendBadge';
import {
    ShoppingBag,
    CalendarDays,
    TrendingUp,
    Wallet,
    Utensils,
} from 'lucide-react';

function StatCard({ icon: Icon, label, value, suffix = '', trend, color }) {
    return (
        <div
            style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 16,
                padding: 22,
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = '';
            }}
        >
            <div style={{ position: 'absolute', top: -20, right: -20, width: 110, height: 110, borderRadius: '50%', background: `${color}18`, filter: 'blur(18px)' }} />
            <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 }}>
                <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        {label}
                    </div>
                    <div style={{ marginTop: 10, fontFamily: 'Outfit', fontWeight: 900, fontSize: '2rem', lineHeight: 1, color: 'var(--color-text)' }}>
                        {value}
                        {suffix && <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-muted)', marginLeft: 8 }}>{suffix}</span>}
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <TrendBadge value={trend} />
                    </div>
                </div>
                <div style={{ width: 46, height: 46, borderRadius: 14, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Icon size={22} color={color} />
                </div>
            </div>
        </div>
    );
}

function Panel({ title, subtitle, right, children, style }) {
    return (
        <div
            className="card"
            style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 16,
                overflow: 'hidden',
                ...style,
            }}
        >
            <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: '1rem', fontFamily: 'Outfit' }}>{title}</div>
                    {subtitle && <div style={{ marginTop: 4, fontSize: '0.82rem', color: 'var(--color-muted)' }}>{subtitle}</div>}
                </div>
                {right ? <div style={{ flexShrink: 0 }}>{right}</div> : null}
            </div>
            <div style={{ padding: 20 }}>{children}</div>
        </div>
    );
}

function formatDateLabel(d) {
    try {
        const dt = typeof d === 'string' ? new Date(d) : d;
        return dt.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    } catch {
        return String(d);
    }
}

function EmptyState({ title, subtitle }) {
    return (
        <div style={{ textAlign: 'center', padding: '54px 16px', color: 'var(--color-muted)' }}>
            <Utensils size={48} style={{ opacity: 0.18, marginBottom: 14 }} />
            <div style={{ fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>{title}</div>
            {subtitle && <div style={{ fontSize: '0.88rem' }}>{subtitle}</div>}
        </div>
    );
}

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            borderRadius: 12,
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            padding: '10px 12px',
            fontSize: '0.85rem',
            boxShadow: '0 18px 50px rgba(0,0,0,0.5)',
        }}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>{label}</div>
            {payload.map((p) => (
                <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18 }}>
                    <span style={{ color: p.color, fontWeight: 700 }}>{p.name}</span>
                    <span style={{ fontWeight: 900 }}>
                        {p.name === 'CA' || p.name === 'Bénéfice'
                            ? `${Number(p.value).toLocaleString('fr-FR')} GNF`
                            : Number(p.value).toLocaleString('fr-FR')}
                    </span>
                </div>
            ))}
        </div>
    );
}

function formatK(v) {
    const n = Number(v) || 0;
    if (n >= 1_000_000) return `${Math.round(n / 100_000) / 10}M`;
    if (n >= 1000) return `${Math.round(n / 100) / 10}k`;
    return `${n}`;
}

function ChartLegend({ payload }) {
    if (!payload?.length) return null;
    return (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, paddingTop: 8 }}>
            {payload.map((p) => (
                <div key={p.value} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem', fontWeight: 700 }}>
                    <span style={{ width: 12, height: 12, borderRadius: 999, background: p.color, boxShadow: `0 0 0 3px ${String(p.color)}22` }} />
                    {p.value}
                </div>
            ))}
        </div>
    );
}

export default function StatsPage() {
    const [mainChartMode, setMainChartMode] = useState('revenus');
    const { data: stats, isLoading, isError, error } = useQuery({
        queryKey: ['stats'],
        queryFn: orderService.getStats,
        refetchInterval: 30000,
    });

    const ordersByDay = useMemo(() => {
        const rows = stats?.ordersByDay || [];
        const map = new Map(
            rows.map((r) => [
                String(r.date).slice(0, 10),
                {
                    orders: Number(r.orders) || 0,
                    revenue: Number(r.revenue) || 0,
                },
            ])
        );

        // Build last 14 days (including today)
        const out = [];
        for (let i = 13; i >= 0; i -= 1) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().slice(0, 10);
            const v = map.get(key) || { orders: 0, revenue: 0 };
            const profit = Math.round((v.revenue || 0) * 0.28);
            out.push({ date: formatDateLabel(key), orders: v.orders, revenue: v.revenue, profit });
        }
        return out;
    }, [stats]);

    const statusData = useMemo(() => {
        const rows = stats?.statusBreakdown || [];
        const labelMap = {
            en_attente: 'En attente',
            acceptee: 'Acceptée',
            refusee: 'Refusée',
            en_preparation: 'En préparation',
            terminee: 'Terminée',
        };
        const mapped = rows
            .map((r) => ({
                name: labelMap[r.status] || r.status,
                value: Number(r.count) || 0,
            }))
            .filter((x) => x.value > 0);

        // Fallback to a single muted slice so the pie renders
        return mapped.length > 0 ? mapped : [{ name: 'Aucune donnée', value: 1 }];
    }, [stats]);

    const topDishes = useMemo(() => {
        const rows = stats?.topDishes || [];
        const mapped = rows.map((r) => ({
            name: r.name,
            quantity: Number(r.quantity) || 0,
            revenue: Number(r.revenue) || 0,
        }));

        // Fallback to render an empty bar chart
        return mapped.length > 0 ? mapped : [{ name: 'Aucun plat', quantity: 0, revenue: 0 }];
    }, [stats]);

    const radarTopDishes = useMemo(() => {
        const rows = (stats?.topDishes || []).slice(0, 5).map((r) => ({
            name: r.name,
            quantity: Number(r.quantity) || 0,
            revenue: Number(r.revenue) || 0,
        }));

        if (!rows.length) return [{ subject: 'Aucun plat', quantity: 0, revenue: 0 }];

        const maxQ = Math.max(...rows.map((r) => r.quantity), 1);
        const maxR = Math.max(...rows.map((r) => r.revenue), 1);

        return rows.map((r) => ({
            subject: r.name,
            quantity: Math.round((r.quantity / maxQ) * 100),
            revenue: Math.round((r.revenue / maxR) * 100),
        }));
    }, [stats]);

    const PIE_COLORS = ['#f97316', '#22c55e', '#3b82f6', '#a855f7', '#ef4444', '#f59e0b'];

    return (
        <AdminLayout>
            <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
                    Analyse
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <h1 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 'clamp(1.4rem,3vw,2rem)' }}>
                        Statistiques <span className="gradient-text">▸</span>
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Période: 14 jours</div>
                        <TrendBadge value={stats?.ordersMoMPercent} />
                    </div>
                </div>
                <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', marginTop: 8 }}>
                    Nombre de commandes, chiffre d’affaires, top plats et évolution quotidienne.
                </p>
            </div>

            {isError && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 14, padding: '12px 16px', color: '#ef4444', fontSize: '0.9rem', marginBottom: 18 }}>
                    {error?.response?.data?.message || error?.message || 'Erreur lors du chargement des statistiques'}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: 16, marginBottom: 18 }}>
                {isLoading ? (
                    [...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }} />)
                ) : (
                    <>
                        <StatCard icon={ShoppingBag} label="Total commandes" value={stats?.totalOrders ?? '—'} trend={stats?.ordersMoMPercent} color="#f97316" />
                        <StatCard icon={CalendarDays} label="Commandes du jour" value={stats?.todayOrders ?? '—'} trend={null} color="#f59e0b" />
                        <StatCard icon={TrendingUp} label="CA du jour" value={stats?.todayRevenue ? Number(stats.todayRevenue).toFixed(0) : '—'} suffix="GNF" trend={null} color="#22c55e" />
                        <StatCard icon={Wallet} label="CA total" value={stats?.totalRevenue ? Number(stats.totalRevenue).toFixed(0) : '—'} suffix="GNF" trend={stats?.revenueMoMPercent} color="#3b82f6" />
                    </>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
                <Panel
                    title="Évolution annuelle"
                    subtitle="Revenus, dépenses et bénéfices mensuels"
                    right={(
                        <div style={{ display: 'flex', gap: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', padding: 4, borderRadius: 14 }}>
                            <button
                                type="button"
                                onClick={() => setMainChartMode('revenus')}
                                style={{
                                    padding: '8px 14px',
                                    borderRadius: 12,
                                    border: '1px solid',
                                    borderColor: mainChartMode === 'revenus' ? 'rgba(52,211,153,0.35)' : 'transparent',
                                    background: mainChartMode === 'revenus' ? 'rgba(52,211,153,0.10)' : 'transparent',
                                    color: mainChartMode === 'revenus' ? '#34d399' : 'rgba(255,255,255,0.55)',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                }}
                            >
                                Revenus
                            </button>
                            <button
                                type="button"
                                onClick={() => setMainChartMode('comparaison')}
                                style={{
                                    padding: '8px 14px',
                                    borderRadius: 12,
                                    border: '1px solid',
                                    borderColor: mainChartMode === 'comparaison' ? 'rgba(99,102,241,0.35)' : 'transparent',
                                    background: mainChartMode === 'comparaison' ? 'rgba(99,102,241,0.10)' : 'transparent',
                                    color: mainChartMode === 'comparaison' ? '#a78bfa' : 'rgba(255,255,255,0.55)',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                }}
                            >
                                Comparaison
                            </button>
                        </div>
                    )}
                >
                    <div style={{ height: 330 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={ordersByDay} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gradOrders" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#f97316" stopOpacity={0.38} />
                                        <stop offset="100%" stopColor="#f97316" stopOpacity={0.03} />
                                    </linearGradient>
                                    <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#22c55e" stopOpacity={0.30} />
                                        <stop offset="100%" stopColor="#22c55e" stopOpacity={0.02} />
                                    </linearGradient>
                                    <linearGradient id="gradProfit" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.22} />
                                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 10" />
                                <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 12 }} tickMargin={12} axisLine={{ stroke: 'rgba(255,255,255,0.10)' }} tickLine={false} />
                                <YAxis tickFormatter={formatK} tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.10)' }} tickLine={false} width={44} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend content={<ChartLegend />} />
                                {mainChartMode === 'comparaison' ? (
                                    <>
                                        <Area type="monotone" dataKey="orders" name="Commandes" stroke="#f97316" fill="url(#gradOrders)" strokeWidth={2.4} dot={false} isAnimationActive animationDuration={900} />
                                        <Area type="monotone" dataKey="revenue" name="CA" stroke="#22c55e" fill="url(#gradRevenue)" strokeWidth={2.6} dot={false} isAnimationActive animationDuration={1100} />
                                    </>
                                ) : (
                                    <>
                                        <Area type="monotone" dataKey="revenue" name="CA" stroke="#22c55e" fill="url(#gradRevenue)" strokeWidth={2.8} dot={false} isAnimationActive animationDuration={900} />
                                        <Area type="monotone" dataKey="profit" name="Bénéfice" stroke="#3b82f6" fill="url(#gradProfit)" strokeWidth={2.5} dot={false} isAnimationActive animationDuration={1100} />
                                    </>
                                )}
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Panel>

                <Panel title="Répartition des statuts" subtitle="Toutes les commandes" right={<span style={{ color: 'var(--color-muted)', fontSize: '0.78rem', fontWeight: 700 }}>Pie chart</span>}>
                    <div style={{ height: 330 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <defs>
                                    <linearGradient id="pieGlow" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stopColor="rgba(255,255,255,0.14)" />
                                        <stop offset="100%" stopColor="rgba(255,255,255,0.04)" />
                                    </linearGradient>
                                </defs>
                                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={105} paddingAngle={3}>
                                    {statusData.map((d, idx) => (
                                        <Cell key={idx} fill={d.name === 'Aucune donnée' ? 'url(#pieGlow)' : PIE_COLORS[idx % PIE_COLORS.length]} stroke="rgba(0,0,0,0.18)" strokeWidth={1} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.7)' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Panel>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, marginTop: 16 }}>
                <Panel title="Plats les plus commandés" subtitle="Top 5 (quantité)" right={<span style={{ color: 'var(--color-muted)', fontSize: '0.78rem', fontWeight: 700 }}>Bar</span>}>
                    <div style={{ height: 320 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topDishes} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="barOrange" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#f97316" stopOpacity={0.95} />
                                        <stop offset="100%" stopColor="#ea580c" stopOpacity={0.55} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="4 6" />
                                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 12 }} tickMargin={10} axisLine={{ stroke: 'rgba(255,255,255,0.10)' }} tickLine={false} />
                                <YAxis tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.10)' }} tickLine={false} width={34} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.7)' }} />
                                <Bar dataKey="quantity" name="Quantité" fill="url(#barOrange)" radius={[12, 12, 8, 8]} isAnimationActive animationDuration={900} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    {stats?.topDishes?.length ? null : (
                        <div style={{ marginTop: 10, fontSize: '0.85rem', color: 'var(--color-muted)' }}>
                            Aucune donnée pour le moment.
                        </div>
                    )}
                </Panel>

                <Panel title="Profil des top plats" subtitle="Indice (0-100) : quantité vs CA" right={<TrendBadge value={stats?.revenueMoMPercent} />}>
                    <div style={{ height: 320 }}>
                        {stats?.topDishes?.length ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart data={radarTopDishes} outerRadius="78%">
                                    <defs>
                                        <linearGradient id="radarOrange" x1="0" y1="0" x2="1" y2="1">
                                            <stop offset="0%" stopColor="#f97316" stopOpacity={0.55} />
                                            <stop offset="100%" stopColor="#ea580c" stopOpacity={0.12} />
                                        </linearGradient>
                                        <linearGradient id="radarGreen" x1="0" y1="0" x2="1" y2="1">
                                            <stop offset="0%" stopColor="#22c55e" stopOpacity={0.45} />
                                            <stop offset="100%" stopColor="#16a34a" stopOpacity={0.10} />
                                        </linearGradient>
                                    </defs>
                                    <PolarGrid stroke="rgba(255,255,255,0.10)" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 12 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }} stroke="rgba(255,255,255,0.10)" />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.7)' }} />
                                    <Radar name="Quantité" dataKey="quantity" stroke="#f97316" fill="url(#radarOrange)" strokeWidth={2} isAnimationActive animationDuration={900} />
                                    <Radar name="CA" dataKey="revenue" stroke="#22c55e" fill="url(#radarGreen)" strokeWidth={2} isAnimationActive animationDuration={1050} />
                                </RadarChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyState title="Aucune donnée" subtitle="Ajoutez des commandes pour voir le profil." />
                        )}
                    </div>
                </Panel>
            </div>
        </AdminLayout>
    );
}
