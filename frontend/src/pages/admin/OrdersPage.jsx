import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '../../layouts/AdminLayout';
import { orderService } from '../../services/orderService';
import { StatusBadge } from '../../components/StatusBadge';
import TrendBadge from '../../components/TrendBadge';
import { buildAssetUrl } from '../../services/api';
import { Check, X, ChevronDown, RefreshCw, Eye, Download, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { jsPDF } from 'jspdf';

function CancelModal({ orderId, onClose, onCancel }) {
    const [reason, setReason] = useState('');
    const presets = ['Rupture de stock', 'Cuisine fermée', 'Problème technique', 'Commande incorrecte'];

    return (
        <div className="modal-overlay">
            <div className="modal-box" style={{ padding: 28 }}>
                <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.2rem', marginBottom: 6 }}>Refuser la commande #{orderId}</h3>
                <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem', marginBottom: 20 }}>Indiquez un motif de refus pour le client.</p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                    {presets.map((p) => (
                        <button key={p} onClick={() => setReason(p)} style={{
                            padding: '6px 14px', borderRadius: 20, border: '1px solid',
                            borderColor: reason === p ? '#f97316' : 'var(--color-border)',
                            background: reason === p ? 'rgba(249,115,22,0.15)' : 'transparent',
                            color: reason === p ? '#f97316' : 'var(--color-muted)',
                            fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                        }}>{p}</button>
                    ))}
                </div>

                <textarea
                    className="input"
                    rows={3}
                    placeholder="Ou saisissez un motif personnalisé..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    style={{ marginBottom: 20, resize: 'none' }}
                />

                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={onClose} className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Annuler</button>
                    <button
                        onClick={() => reason.trim() && onCancel(reason)}
                        disabled={!reason.trim()}
                        className="btn btn-danger"
                        style={{ flex: 1, justifyContent: 'center', opacity: reason.trim() ? 1 : 0.5 }}
                    >
                        <X size={15} /> Confirmer le refus
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function OrdersPage() {
    const { data: stats } = useQuery({
        queryKey: ['stats'],
        queryFn: orderService.getStats,
        refetchInterval: 30000,
    });
    const qc = useQueryClient();
    const [cancelTarget, setCancelTarget] = useState(null);
    const [detailTarget, setDetailTarget] = useState(null);
    const [statusFilter, setStatusFilter] = useState('');

    const { data: orders = [], isLoading, refetch } = useQuery({
        queryKey: ['admin-orders', statusFilter],
        queryFn: () => orderService.getAll(statusFilter ? { status: statusFilter } : {}),
        refetchInterval: 15000,
    });

    const acceptMutation = useMutation({
        mutationFn: orderService.accept,
        onSuccess: () => qc.invalidateQueries(['admin-orders']),
    });

    const cancelMutation = useMutation({
        mutationFn: ({ id, reason }) => orderService.cancel(id, reason),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-orders'] }); setCancelTarget(null); },
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => orderService.remove(id),
        onMutate: async (id) => {
            await qc.cancelQueries({ queryKey: ['admin-orders'] });
            const previous = qc.getQueriesData({ queryKey: ['admin-orders'] });
            qc.setQueriesData({ queryKey: ['admin-orders'] }, (old) => {
                if (!Array.isArray(old)) return old;
                return old.filter((o) => o && o.id !== id);
            });
            return { previous };
        },
        onError: (err, id, ctx) => {
            if (ctx?.previous) {
                ctx.previous.forEach(([key, data]) => {
                    qc.setQueryData(key, data);
                });
            }

            const apiMsg = err?.response?.data?.message;
            // eslint-disable-next-line no-console
            console.error('Delete order failed:', err);
            window.alert(apiMsg || 'Impossible de supprimer la commande');
        },
        onSettled: () => qc.invalidateQueries({ queryKey: ['admin-orders'] }),
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, status }) => orderService.updateStatus(id, status),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-orders'] }),
    });

    const statusOptions = [
        { value: '', label: 'Tous' },
        { value: 'en_attente', label: 'En attente' },
        { value: 'acceptee', label: 'Acceptée' },
        { value: 'refusee', label: 'Refusée' },
        { value: 'en_preparation', label: 'En préparation' },
        { value: 'terminee', label: 'Terminée' },
    ];

    const nextStatus = { acceptee: 'en_preparation', en_preparation: 'terminee' };

    return (
        <AdminLayout>
            {cancelTarget && (
                <CancelModal
                    orderId={cancelTarget}
                    onClose={() => setCancelTarget(null)}
                    onCancel={(reason) => cancelMutation.mutate({ id: cancelTarget, reason })}
                />
            )}
            {detailTarget && (
                <OrderDetailModal
                    order={detailTarget}
                    onClose={() => setDetailTarget(null)}
                />
            )}

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.6rem' }}>Commandes</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 6 }}>
                        <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>{orders.length} commande{orders.length !== 1 ? 's' : ''}</p>
                        <TrendBadge value={stats?.ordersMoMPercent} />
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="input"
                        style={{ width: 'auto', paddingRight: 36 }}
                    >
                        {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <button onClick={() => refetch()} className="btn btn-ghost" style={{ padding: '10px 12px' }}>
                        <RefreshCw size={16} />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'var(--color-surface-2)' }}>
                                {['#', 'Client', 'Téléphone', 'Table', 'Items', 'Total', 'Statut', 'Date', 'Actions'].map((h) => (
                                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: '0.73rem', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading && [...Array(5)].map((_, i) => (
                                <tr key={i}><td colSpan={9} style={{ padding: '14px 16px' }}><div className="skeleton" style={{ height: 20 }} /></td></tr>
                            ))}
                            {!isLoading && orders.map((order) => (
                                <tr key={order.id} style={{ borderTop: '1px solid var(--color-border)', transition: 'background 0.15s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-2)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '14px 14px', fontWeight: 700, color: '#f97316', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>#{order.id}</td>
                                    <td style={{ padding: '14px 14px', fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap' }}>{order.customer_name}</td>
                                    <td style={{ padding: '14px 14px', color: 'var(--color-muted)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{order.customer_phone}</td>
                                    <td style={{ padding: '14px 14px', color: 'var(--color-muted)', fontSize: '0.85rem' }}>
                                        <div>{order.table_number || '—'}</div>
                                        {order.comment && (
                                            <div style={{ fontSize: '0.72rem', marginTop: 4, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={order.comment}>
                                                {order.comment}
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: '14px 14px', fontSize: '0.8rem' }}>
                                        {order.items?.map((it) => (
                                            <div key={it.id} style={{ color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>{it.dish_name} ×{it.quantity}</div>
                                        ))}
                                    </td>
                                    <td style={{ padding: '14px 14px', fontWeight: 700, fontSize: '0.875rem', whiteSpace: 'nowrap' }}>{Number(order.total_price).toFixed(2)} GNF</td>
                                    <td style={{ padding: '14px 14px' }}>
                                        <StatusBadge status={order.status} />
                                        {order.cancel_reason && (
                                            <div style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: 4, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={order.cancel_reason}>{order.cancel_reason}</div>
                                        )}
                                    </td>
                                    <td style={{ padding: '14px 14px', color: 'var(--color-muted)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                                        {new Date(order.created_at).toLocaleString('fr-FR')}
                                    </td>
                                    <td style={{ padding: '14px 14px' }}>
                                        <div style={{ display: 'flex', gap: 6, flexWrap: 'nowrap' }}>
                                            {order.status === 'en_attente' && (
                                                <>
                                                    <button
                                                        onClick={() => acceptMutation.mutate(order.id)}
                                                        className="btn btn-success"
                                                        style={{ padding: '6px 10px', fontSize: '0.78rem', gap: 4 }}
                                                    >
                                                        <Check size={13} /> Accepter
                                                    </button>
                                                    <button
                                                        onClick={() => setCancelTarget(order.id)}
                                                        className="btn btn-danger"
                                                        style={{ padding: '6px 10px', fontSize: '0.78rem', gap: 4 }}
                                                    >
                                                        <X size={13} /> Refuser
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => {
                                                    console.log('Voir clicked, order:', order);
                                                    setDetailTarget(order);
                                                }}
                                                className="btn btn-ghost"
                                                style={{ padding: '6px 10px', fontSize: '0.78rem', gap: 4, whiteSpace: 'nowrap' }}
                                                title="Voir les détails"
                                            >
                                                <Eye size={13} /> Voir
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (!window.confirm(`Supprimer la commande #${order.id} ?`)) return;
                                                    deleteMutation.mutate(order.id);
                                                }}
                                                className="btn btn-danger"
                                                style={{ padding: '6px 10px', fontSize: '0.78rem', gap: 4, whiteSpace: 'nowrap' }}
                                                title="Supprimer la commande"
                                                disabled={deleteMutation.isPending}
                                            >
                                                <Trash2 size={13} /> Supprimer
                                            </button>
                                            {nextStatus[order.status] && (
                                                <button
                                                    onClick={() => statusMutation.mutate({ id: order.id, status: nextStatus[order.status] })}
                                                    className="btn btn-ghost"
                                                    style={{ padding: '6px 10px', fontSize: '0.78rem', gap: 4, whiteSpace: 'nowrap' }}
                                                >
                                                    <ChevronDown size={13} /> Avancer
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!isLoading && orders.length === 0 && (
                                <tr><td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: 'var(--color-muted)' }}>Aucune commande trouvée</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}

function OrderDetailModal({ order, onClose }) {
    if (!order) return null;

    const resolveImageUrl = (image) => {
        const raw = typeof image === 'string' ? image.trim() : '';
        if (!raw) return null;
        if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
        if (raw.startsWith('/uploads/')) return buildAssetUrl(raw);
        return buildAssetUrl(`/uploads/${raw}`);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ padding: 28, maxWidth: 560, width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.3rem' }}>Détails de la commande #{order.id}</h3>
                    <button onClick={onClose} className="btn btn-ghost" style={{ padding: '6px 10px' }}>
                        <X size={16} />
                    </button>
                </div>

                <div style={{ display: 'grid', gap: 16, marginBottom: 20 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
                        <div>
                            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Client</div>
                            <div style={{ fontWeight: 600 }}>{order.customer_name}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Téléphone</div>
                            <div style={{ fontWeight: 600 }}>{order.customer_phone}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Table</div>
                            <div style={{ fontWeight: 600 }}>{order.table_number || '—'}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Statut</div>
                            <StatusBadge status={order.status} />
                        </div>
                    </div>

                    {order.comment && (
                        <div>
                            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Commentaire</div>
                            <div style={{ background: 'var(--color-surface-2)', padding: 10, borderRadius: 10, fontSize: '0.88rem' }}>{order.comment}</div>
                        </div>
                    )}

                    {order.cancel_reason && (
                        <div>
                            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Motif de refus</div>
                            <div style={{ background: 'rgba(239,68,68,0.1)', padding: 10, borderRadius: 10, fontSize: '0.88rem', color: '#ef4444' }}>{order.cancel_reason}</div>
                        </div>
                    )}

                    <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Articles</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '38vh', overflow: 'auto', paddingRight: 6 }}>
                            {order.items?.map((it) => (
                                <div key={it.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 12px', borderRadius: 10, border: '1px solid var(--color-border)', background: 'var(--color-surface-2)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
                                        {resolveImageUrl(it.image) && (
                                            <img
                                                src={resolveImageUrl(it.image)}
                                                alt={it.dish_name}
                                                style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
                                            />
                                        )}
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ fontWeight: 600 }}>{it.dish_name}</div>
                                            {it.comment && <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)', marginTop: 2 }}>{it.comment}</div>}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, whiteSpace: 'nowrap' }}>
                                        <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>×{it.quantity}</span>
                                        <span style={{ fontWeight: 700 }}>{Number(it.price).toFixed(2)} GNF</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--color-border)' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total</div>
                        <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.2rem', color: '#f97316' }}>{Number(order.total_price).toFixed(2)} GNF</div>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>Passée le</span>
                        <span style={{ fontWeight: 600 }}>{new Date(order.created_at).toLocaleString('fr-FR')}</span>
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                    <button
                        onClick={() => {
                            const pdf = new jsPDF();
                            const pageWidth = pdf.internal.pageSize.getWidth();
                            const primaryColor = [249, 115, 22]; // #f97316
                            let y = 20;
                            const lineHeight = 8;
                            const addLine = (text, bold = false, size = 12, color = null) => {
                                pdf.setFontSize(size);
                                if (color) pdf.setTextColor(...color);
                                if (bold) pdf.setFont(undefined, 'bold');
                                pdf.text(text, 20, y);
                                pdf.setFont(undefined, 'normal');
                                pdf.setTextColor(0);
                                y += lineHeight;
                            };
                            // Header band
                            pdf.setFillColor(...primaryColor);
                            pdf.rect(0, 0, pageWidth, 30, 'F');
                            pdf.setTextColor(255);
                            addLine('REÇU DE COMMANDE', true, 18, [255,255,255]);
                            y = 40;
                            addLine(`Commande #${order.id}`, true, 14, primaryColor);
                            addLine(`Date : ${new Date(order.created_at).toLocaleString('fr-FR')}`);
                            y += 4;
                            pdf.setDrawColor(230);
                            pdf.line(20, y, pageWidth - 20, y);
                            y += 8;
                            addLine('Client :', true, 12, primaryColor);
                            addLine(`${order.customer_name} | ${order.customer_phone}`);
                            addLine(`Table : ${order.table_number || '—'}`);
                            addLine(`Statut : ${order.status}`);
                            if (order.comment) {
                                y += 2;
                                addLine('Commentaire :', true, 12, primaryColor);
                                addLine(order.comment);
                            }
                            y += 6;
                            pdf.setDrawColor(230);
                            pdf.line(20, y, pageWidth - 20, y);
                            y += 8;
                            addLine('Articles :', true, 12, primaryColor);
                            (order.items || []).forEach(it => {
                                addLine(`- ${it.dish_name} ×${it.quantity}  ${Number(it.price).toFixed(2)} GNF`);
                            });
                            y += 6;
                            pdf.setDrawColor(230);
                            pdf.line(20, y, pageWidth - 20, y);
                            y += 8;
                            addLine(`TOTAL : ${Number(order.total_price).toFixed(2)} GNF`, true, 16, primaryColor);
                            pdf.save(`recu-commande-${order.id}.pdf`);
                        }}
                        className="btn btn-ghost"
                        style={{ gap: 6, fontSize: '0.85rem' }}
                    >
                        <Download size={16} /> Télécharger reçu (PDF)
                    </button>
                </div>
            </div>
        </div>
    );
}
