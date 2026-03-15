import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '../../services/orderService';
import ClientLayout from '../../layouts/ClientLayout';
import { buildAssetUrl } from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import { CheckCircle, Clock, XCircle, ChefHat, Package } from 'lucide-react';

const statusIcons = {
    en_attente: { icon: Clock, color: '#f59e0b', msg: 'Votre commande est en attente de validation...' },
    acceptee: { icon: CheckCircle, color: '#22c55e', msg: 'Votre commande a été acceptée !' },
    refusee: { icon: XCircle, color: '#ef4444', msg: 'Votre commande a été refusée.' },
    en_preparation: { icon: ChefHat, color: '#3b82f6', msg: 'Votre commande est en préparation !' },
    terminee: { icon: Package, color: '#a855f7', msg: 'Commande prête – Bon appétit ! 🎉' },
};

export default function OrderStatusPage() {
    const { id } = useParams();

    const { data: order, isLoading, error } = useQuery({
        queryKey: ['order', id],
        queryFn: () => orderService.getById(id),
        refetchInterval: 10000, // Poll every 10s
    });

    if (isLoading) return (
        <ClientLayout>
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                <div className="skeleton" style={{ width: 80, height: 80, borderRadius: '50%', margin: '0 auto 20px' }} />
                <div className="skeleton" style={{ height: 24, width: 200, margin: '0 auto 12px' }} />
                <div className="skeleton" style={{ height: 16, width: 300, margin: '0 auto' }} />
            </div>
        </ClientLayout>
    );

    if (error || !order) return (
        <ClientLayout>
            <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--color-muted)' }}>
                <p>Commande introuvable.</p>
                <Link to="/" className="btn btn-primary" style={{ marginTop: 20 }}>Retour au menu</Link>
            </div>
        </ClientLayout>
    );

    const si = statusIcons[order.status] || statusIcons.en_attente;
    const Icon = si.icon;

    const resolveImageUrl = (image) => {
        const raw = typeof image === 'string' ? image.trim() : '';
        if (!raw) return null;
        if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
        if (raw.startsWith('/uploads/')) return buildAssetUrl(raw);
        return buildAssetUrl(`/uploads/${raw}`);
    };

    return (
        <ClientLayout>
            <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 24px' }}>
                {/* Status card */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ position: 'relative', display: 'inline-block', marginBottom: 20 }}>
                        <div style={{ width: 90, height: 90, borderRadius: '50%', background: `rgba(${si.color === '#f59e0b' ? '245,158,11' : si.color === '#22c55e' ? '34,197,94' : si.color === '#ef4444' ? '239,68,68' : si.color === '#3b82f6' ? '59,130,246' : '168,85,247'},0.15)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                            <Icon size={40} color={si.color} />
                        </div>
                    </div>
                    <div style={{ marginBottom: 8 }}><StatusBadge status={order.status} /></div>
                    <h1 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.6rem', marginTop: 12, marginBottom: 8 }}>
                        Commande <span className="gradient-text">#{order.id}</span>
                    </h1>
                    <p style={{ color: 'var(--color-muted)', fontSize: '0.95rem' }}>{si.msg}</p>
                    {order.status === 'refusee' && order.cancel_reason && (
                        <div style={{ marginTop: 16, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '14px 20px', color: '#ef4444', fontSize: '0.875rem' }}>
                            <strong>Motif :</strong> {order.cancel_reason}
                        </div>
                    )}
                </div>

                {/* Info card */}
                <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 16, padding: 24, marginBottom: 20 }}>
                    <h2 style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Infos client</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        {[
                            ['Nom', order.customer_name],
                            ['Téléphone', order.customer_phone],
                            ['Table / Livraison', order.table_number || '—'],
                            ['Commentaire', order.comment || '—'],
                            ['Date', new Date(order.created_at).toLocaleString('fr-FR')],
                        ].map(([k, v]) => (
                            <div key={k}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: 2 }}>{k}</div>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{v}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Items */}
                {order.items?.length > 0 && (
                    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 16, padding: 24, marginBottom: 20 }}>
                        <h2 style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Plats commandés</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {order.items.map((item) => {
                                const img = resolveImageUrl(item.image);

                                return (
                                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--color-border)', gap: 12 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                                            {img && (
                                                <img
                                                    src={img}
                                                    alt={item.dish_name}
                                                    style={{ width: 42, height: 42, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
                                                />
                                            )}
                                            <div style={{ minWidth: 0 }}>
                                                <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.dish_name}</div>
                                                <div style={{ color: 'var(--color-muted)', fontSize: '0.85rem' }}>× {item.quantity}</div>
                                            </div>
                                        </div>
                                        <span style={{ fontWeight: 700, color: '#f97316', whiteSpace: 'nowrap' }}>{(item.price * item.quantity).toFixed(2)} GNF</span>
                                    </div>
                                );
                            })}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, fontWeight: 800, fontSize: '1.1rem' }}>
                            <span>Total</span>
                            <span className="gradient-text">{Number(order.total_price).toFixed(2)} GNF</span>
                        </div>
                    </div>
                )}

                <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: 20 }}>
                    Cette page se rafraîchit automatiquement toutes les 10 secondes.
                </p>

                <Link to="/" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
                    ← Retour au menu
                </Link>
            </div>
        </ClientLayout>
    );
}
