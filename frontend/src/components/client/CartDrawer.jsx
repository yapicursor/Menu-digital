import useCartStore from '../../store/cartStore';
import { Plus, Minus, Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import { buildAssetUrl } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function CartDrawer({ open, onClose }) {
    const { items, updateQuantity, removeItem } = useCartStore();
    const navigate = useNavigate();
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const handleCheckout = () => {
        onClose();
        navigate('/commander');
    };

    return (
        <>
            {/* Overlay */}
            {open && (
                <div
                    onClick={onClose}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', zIndex: 60 }}
                />
            )}

            {/* Drawer */}
            <div style={{
                position: 'fixed', top: 0, right: 0, height: '100%',
                width: Math.min(420, window.innerWidth),
                background: 'var(--color-surface)',
                borderLeft: '1px solid var(--color-border)',
                zIndex: 70,
                transform: open ? 'translateX(0)' : 'translateX(100%)',
                transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
                display: 'flex', flexDirection: 'column',
            }}>
                {/* Header */}
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.1rem' }}>
                        <ShoppingCart size={20} color="#f97316" />
                        Mon Panier
                        {items.length > 0 && (
                            <span style={{ background: 'rgba(249,115,22,0.15)', color: '#f97316', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                                {items.reduce((s, i) => s + i.quantity, 0)}
                            </span>
                        )}
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--color-muted)', cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1 }}>×</button>
                </div>

                {/* Items */}
                <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
                    {items.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-muted)' }}>
                            <ShoppingCart size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
                            <p style={{ fontWeight: 500 }}>Votre panier est vide</p>
                            <p style={{ fontSize: '0.85rem', marginTop: 8 }}>Ajoutez des plats depuis le menu</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {items.map((item) => (
                                <div key={item.id} className="fade-in-up" style={{
                                    background: 'var(--color-surface-2)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 14, padding: 14,
                                    display: 'flex', gap: 12, alignItems: 'center',
                                }}>
                                    {/* Image */}
                                    {item.image ? (
                                        <div
                                            aria-label={item.name}
                                            style={{ width: 56, height: 56, borderRadius: 10, overflow: 'hidden', display: 'flex', flexShrink: 0 }}
                                        >
                                            <div
                                                style={{
                                                    width: '50%',
                                                    height: '100%',
                                                    backgroundImage: `url(${buildAssetUrl(item.image)})`,
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'left center',
                                                    backgroundRepeat: 'no-repeat',
                                                }}
                                            />
                                            <div
                                                style={{
                                                    width: '50%',
                                                    height: '100%',
                                                    backgroundImage: `url(${buildAssetUrl(item.image)})`,
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'right center',
                                                    backgroundRepeat: 'no-repeat',
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div style={{ width: 56, height: 56, borderRadius: 10, background: 'rgba(249,115,22,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            🍽️
                                        </div>
                                    )}
                                    {/* Info */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                                        <div style={{ color: '#f97316', fontWeight: 700, fontSize: '0.875rem', marginTop: 2 }}>
                                            {(item.price * item.quantity).toFixed(2)} GNF
                                        </div>
                                    </div>
                                    {/* Qty controls */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <Minus size={12} />
                                        </button>
                                        <span style={{ fontWeight: 700, minWidth: 20, textAlign: 'center', fontSize: '0.875rem' }}>{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#f97316,#ea580c)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <Plus size={12} />
                                        </button>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 4 }}
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div style={{ padding: '20px 24px', borderTop: '1px solid var(--color-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontWeight: 700, fontSize: '1.1rem' }}>
                            <span style={{ color: 'var(--color-muted)' }}>Total</span>
                            <span className="gradient-text">{total.toFixed(2)} GNF</span>
                        </div>
                        <button onClick={handleCheckout} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.95rem', padding: '13px' }}>
                            Passer la commande <ArrowRight size={16} />
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
