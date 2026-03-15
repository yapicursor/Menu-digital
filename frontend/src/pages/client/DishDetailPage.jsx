import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ClientLayout from '../../layouts/ClientLayout';
import { dishService } from '../../services/dishService';
import { buildAssetUrl } from '../../services/api';
import useCartStore from '../../store/cartStore';
import { ArrowLeft, Plus, ShoppingCart, CheckCircle, XCircle, Tag } from 'lucide-react';

export default function DishDetailPage() {
    const { id } = useParams();
    const addItem = useCartStore((s) => s.addItem);
    const items = useCartStore((s) => s.items);

    const { data: dish, isLoading, error } = useQuery({
        queryKey: ['dish', id],
        queryFn: () => dishService.getById(id),
    });

    const inCart = dish ? items.find((i) => i.id === dish.id) : null;

    return (
        <ClientLayout>
            <div style={{ maxWidth: 1180, margin: '0 auto', padding: '32px 24px' }}>
                <Link
                    to="/"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--color-muted)', textDecoration: 'none', marginBottom: 18, fontSize: '0.9rem', fontWeight: 600 }}
                >
                    <ArrowLeft size={16} /> Retour au menu
                </Link>

                {isLoading && (
                    <div>
                        <div className="skeleton" style={{ height: 280, borderRadius: 18, marginBottom: 18 }} />
                        <div className="skeleton" style={{ height: 26, width: 280, marginBottom: 10 }} />
                        <div className="skeleton" style={{ height: 16, width: 520, marginBottom: 6 }} />
                        <div className="skeleton" style={{ height: 16, width: 460 }} />
                    </div>
                )}

                {(error || !dish) && !isLoading && (
                    <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--color-muted)' }}>
                        <p>Plat introuvable.</p>
                        <Link to="/" className="btn btn-primary" style={{ marginTop: 18 }}>Retour au menu</Link>
                    </div>
                )}

                {dish && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20 }}>
                        {/* Image */}
                        <div style={{ borderRadius: 18, overflow: 'hidden', border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
                            <div style={{ height: 420, background: 'var(--color-surface-2)' }}>
                                {dish.image ? (
                                    <div
                                        aria-label={dish.name}
                                        style={{ width: '100%', height: '100%', display: 'flex' }}
                                    >
                                        <div
                                            style={{
                                                width: '50%',
                                                height: '100%',
                                                backgroundImage: `url(${buildAssetUrl(dish.image)})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'left center',
                                                backgroundRepeat: 'no-repeat',
                                            }}
                                        />
                                        <div
                                            style={{
                                                width: '50%',
                                                height: '100%',
                                                backgroundImage: `url(${buildAssetUrl(dish.image)})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'right center',
                                                backgroundRepeat: 'no-repeat',
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', opacity: 0.25 }}>
                                        🍽️
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Info */}
                        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 18, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                                <div style={{ minWidth: 0 }}>
                                    <h1 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '1.6rem', lineHeight: 1.2, marginBottom: 6 }}>
                                        {dish.name}
                                    </h1>
                                    {dish.category_name && (
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--color-muted)', fontWeight: 600 }}>
                                            <Tag size={14} /> {dish.category_name}
                                        </div>
                                    )}
                                </div>
                                <div style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '1.4rem', color: '#f97316', whiteSpace: 'nowrap' }}>
                                    {Number(dish.price).toFixed(2)} GNF
                                </div>
                            </div>

                            {/* Availability */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 2 }}>
                                {dish.available ? (
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#22c55e', fontWeight: 800, fontSize: '0.85rem' }}>
                                        <CheckCircle size={16} /> Disponible
                                    </div>
                                ) : (
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#ef4444', fontWeight: 800, fontSize: '0.85rem' }}>
                                        <XCircle size={16} /> Indisponible
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            {dish.description && (
                                <div style={{ color: 'var(--color-muted)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                                    {dish.description}
                                </div>
                            )}

                            <div style={{ marginTop: 'auto', display: 'flex', gap: 10 }}>
                                <Link to="/commander" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>
                                    <ShoppingCart size={16} /> Voir le panier
                                </Link>
                                <button
                                    type="button"
                                    disabled={!dish.available}
                                    onClick={() => addItem(dish)}
                                    className="btn btn-primary"
                                    style={{ flex: 1, justifyContent: 'center', opacity: dish.available ? 1 : 0.6 }}
                                >
                                    <Plus size={16} />
                                    {inCart ? `Ajouter (x${inCart.quantity})` : 'Ajouter au panier'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ClientLayout>
    );
}
