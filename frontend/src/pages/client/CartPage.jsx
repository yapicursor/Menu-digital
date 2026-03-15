import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import ClientLayout from '../../layouts/ClientLayout';
import useCartStore from '../../store/cartStore';
import { orderService } from '../../services/orderService';
import { buildAssetUrl } from '../../services/api';
import { Minus, Plus, Trash2, User, Phone, Hash, MessageSquare, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const schema = z.object({
    customer_name: z.string().min(2, 'Nom requis (min 2 caractères)'),
    customer_email: z.string().email('Email invalide'),
    customer_phone: z.string().min(8, 'Numéro de téléphone invalide'),
    table_number: z.string().optional(),
    comment: z.string().optional(),
});

const RESTAURANT_ID = Number(import.meta.env.VITE_RESTAURANT_ID || 1);

export default function CartPage() {
    const { items, updateQuantity, removeItem, clearCart } = useCartStore();
    const navigate = useNavigate();
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

    const mutation = useMutation({
        mutationFn: (data) =>
            orderService.create({
                ...data,
                restaurant_id: RESTAURANT_ID,
                items: items.map((i) => ({ dish_id: i.id, quantity: i.quantity })),
            }),
        onSuccess: (order) => {
            clearCart();
            navigate(`/commande/${order.id}`);
        },
    });

    if (items.length === 0) {
        return (
            <ClientLayout>
                <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--color-muted)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: 20 }}>🛒</div>
                    <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.5rem', marginBottom: 12 }}>Panier vide</h2>
                    <p style={{ marginBottom: 24 }}>Ajoutez des plats depuis le menu pour passer votre commande.</p>
                    <Link to="/" className="btn btn-primary">← Retour au menu</Link>
                </div>
            </ClientLayout>
        );
    }

    return (
        <ClientLayout>
            <div className="cart-container" style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
                <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--color-muted)', textDecoration: 'none', marginBottom: 28, fontSize: '0.875rem', fontWeight: 500 }}>
                    <ArrowLeft size={16} /> Continuer mes achats
                </Link>

                <h1 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.8rem', marginBottom: 32 }}>
                    Votre <span className="gradient-text">Commande</span>
                </h1>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 28 }}>
                    {/* Cart items */}
                    <div>
                        <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 16, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Récapitulatif</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {items.map((item) => (
                                <div key={item.id} className="cart-item" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 14, padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
                                    {item.image ? (
                                        <img src={buildAssetUrl(item.image)} alt={item.name} className="cart-item-img" style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }} />
                                    ) : (
                                        <div style={{ width: 52, height: 52, borderRadius: 10, background: 'rgba(249,115,22,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.3rem' }}>🍽️</div>
                                    )}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600 }}>{item.name}</div>
                                        <div style={{ color: '#f97316', fontWeight: 700, fontSize: '0.9rem' }}>{Number(item.price).toFixed(2)} GNF / unité</div>
                                    </div>
                                    <div className="cart-item-actions" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface-2)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={13} /></button>
                                        <span style={{ fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#f97316,#ea580c)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={13} /></button>
                                        <button onClick={() => removeItem(item.id)} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 4 }}><Trash2 size={13} /></button>
                                    </div>
                                    <div className="cart-item-price" style={{ fontWeight: 700, minWidth: 80, textAlign: 'right', color: 'var(--color-text)', fontSize: '0.95rem' }}>
                                        {(item.price * item.quantity).toFixed(2)} GNF
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Total */}
                        <div className="cart-total" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 14, padding: 16, marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Total</span>
                            <span className="gradient-text" style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.4rem' }}>{total.toFixed(2)} GNF</span>
                        </div>
                    </div>

                    {/* Order form */}
                    <div>
                        <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 16, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vos informations</h2>
                        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="cart-form" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {/* Name */}
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    <User size={13} /> Nom complet *
                                </label>
                                <input className={`input ${errors.customer_name ? 'input-error' : ''}`} placeholder="Votre nom" {...register('customer_name')} />
                                {errors.customer_name && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: 4 }}>{errors.customer_name.message}</p>}
                            </div>

                            {/* Email */}
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    <User size={13} /> Email *
                                </label>
                                <input className={`input ${errors.customer_email ? 'input-error' : ''}`} placeholder="ex: client@gmail.com" {...register('customer_email')} />
                                {errors.customer_email && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: 4 }}>{errors.customer_email.message}</p>}
                            </div>

                            {/* Phone */}
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    <Phone size={13} /> Téléphone *
                                </label>
                                <input className={`input ${errors.customer_phone ? 'input-error' : ''}`} placeholder="06 00 00 00 00" {...register('customer_phone')} />
                                {errors.customer_phone && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: 4 }}>{errors.customer_phone.message}</p>}
                            </div>

                            {/* Table */}
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    <Hash size={13} /> N° de table (ou livraison)
                                </label>
                                <input className="input" placeholder="Table 5 / Livraison / Emporter" {...register('table_number')} />
                            </div>

                            {/* Comment */}
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    <MessageSquare size={13} /> Commentaire
                                </label>
                                <textarea className="input" rows={3} placeholder="Allergies, instructions spéciales..." {...register('comment')} style={{ resize: 'vertical' }} />
                            </div>

                            {mutation.isError && (
                                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px', color: '#ef4444', fontSize: '0.875rem' }}>
                                    <div>{mutation.error?.response?.data?.message || 'Erreur lors de la commande'}</div>
                                    {mutation.error?.response?.data?.details && (
                                        <div style={{ marginTop: 6, color: 'var(--color-muted)', fontSize: '0.8rem' }}>
                                            {mutation.error.response.data.details}
                                        </div>
                                    )}
                                </div>
                            )}

                            <button type="submit" disabled={mutation.isPending} className="btn btn-primary" style={{ justifyContent: 'center', fontSize: '1rem', padding: '14px', marginTop: 4 }}>
                                {mutation.isPending ? 'Envoi en cours...' : `✓ Confirmer la commande · ${total.toFixed(2)} GNF`}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </ClientLayout>
    );
}
