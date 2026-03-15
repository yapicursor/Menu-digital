import { useQuery } from '@tanstack/react-query';
import AdminLayout from '../../layouts/AdminLayout';
import { orderService } from '../../services/orderService';
import { dishService } from '../../services/dishService';
import { ShoppingBag, Clock, TrendingUp, Utensils, ArrowUp } from 'lucide-react';
import useAuthStore from '../../store/authStore';

import TrendBadge from '../../components/TrendBadge';

function StatCard({ icon: Icon, label, value, color, suffix = '', trend }) {
    return (
        <div style={{
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: 16, padding: 24, position: 'relative', overflow: 'hidden',
            transition: 'transform 0.2s, box-shadow 0.2s',
        }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
        >
            {/* Glow */}
            <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: `${color}18`, filter: 'blur(20px)', pointerEvents: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600, marginBottom: 10 }}>{label}</p>
                    <p style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '2rem', color: 'var(--color-text)', lineHeight: 1 }}>
                    <div style={{ marginTop: 12 }}>
                        <TrendBadge value={trend} />
                    </div>
                        {value}<span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-muted)', marginLeft: 4 }}>{suffix}</span>
                    </p>
                </div>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={22} color={color} />
                </div>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const restaurant = useAuthStore((s) => s.restaurant);

    const { data: stats, isLoading: sLoading } = useQuery({
        queryKey: ['stats'],
        queryFn: orderService.getStats,
        refetchInterval: 30000,
    });

    const { data: recentOrders = [] } = useQuery({
        queryKey: ['admin-orders'],
        queryFn: () => orderService.getAll({}),
        refetchInterval: 15000,
    });

    const statCards = [
        { icon: ShoppingBag, label: 'Commandes aujourd\'hui', value: stats?.todayOrders ?? '—', color: '#f97316' },
        { icon: Clock, label: 'En attente', value: stats?.pendingOrders ?? '—', color: '#f59e0b' },
        { icon: TrendingUp, label: 'CA aujourd\'hui', value: stats?.todayRevenue ? Number(stats.todayRevenue).toFixed(0) : '—', suffix: 'GNF', color: '#22c55e' },
        { icon: Utensils, label: 'Nombre de plats', value: stats?.dishCount ?? '—', color: '#3b82f6' },
    ];

    const statusMap = {
        en_attente: 'badge-pending', acceptee: 'badge-accepted',
        refusee: 'badge-refused', en_preparation: 'badge-prep', terminee: 'badge-done',
    };
    const statusLabel = {
        en_attente: 'En attente', acceptee: 'Acceptée',
        refusee: 'Refusée', en_preparation: 'En préparation', terminee: 'Terminée',
    };

    return (
        <AdminLayout>
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Bienvenue</div>
                <h1 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 'clamp(1.4rem,3vw,2rem)' }}>
                    {restaurant?.name || 'Tableau de bord'} <span className="gradient-text">▸</span>
                </h1>
            </div>

            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 16, marginBottom: 36 }}>
                {sLoading
                    ? [...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 110, borderRadius: 16 }} />)
                    : statCards.map((s) => <StatCard key={s.label} {...s} />)
                }
            </div>

            {/* Recent orders */}
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Commandes récentes</h2>
                    <a href="/admin/orders" style={{ color: '#f97316', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>Voir tout →</a>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'var(--color-surface-2)' }}>
                                {['#', 'Client', 'Téléphone', 'Table', 'Total', 'Statut', 'Date'].map((h) => (
                                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.slice(0, 8).map((order, i) => (
                                <tr key={order.id} style={{ borderTop: '1px solid var(--color-border)', transition: 'background 0.15s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-2)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#f97316', fontSize: '0.875rem' }}>#{order.id}</td>
                                    <td style={{ padding: '14px 16px', fontWeight: 600, fontSize: '0.875rem' }}>{order.customer_name}</td>
                                    <td style={{ padding: '14px 16px', color: 'var(--color-muted)', fontSize: '0.875rem' }}>{order.customer_phone}</td>
                                    <td style={{ padding: '14px 16px', color: 'var(--color-muted)', fontSize: '0.875rem' }}>{order.table_number || '—'}</td>
                                    <td style={{ padding: '14px 16px', fontWeight: 700, fontSize: '0.875rem' }}>{Number(order.total_price).toFixed(2)} GNF</td>
                                    <td style={{ padding: '14px 16px' }}><span className={`badge ${statusMap[order.status]}`}>{statusLabel[order.status]}</span></td>
                                    <td style={{ padding: '14px 16px', color: 'var(--color-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{new Date(order.created_at).toLocaleString('fr-FR')}</td>
                                </tr>
                            ))}
                            {recentOrders.length === 0 && (
                                <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--color-muted)' }}>Aucune commande pour l'instant</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
