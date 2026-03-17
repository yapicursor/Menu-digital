import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import ClientLayout from '../../layouts/ClientLayout';
import { orderService } from '../../services/orderService';
import { Phone, Search, Package, Clock, CheckCircle, XCircle, ChefHat } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../../components/StatusBadge';

const schema = z.object({
    customer_phone: z.string().min(9, 'Numéro de téléphone invalide'),
});

export default function OrderHistoryPage() {
    const [searchPhone, setSearchPhone] = useState('');
    
    const { register, handleSubmit, formState: { errors } } = useForm({ 
        resolver: zodResolver(schema) 
    });

    const { data: orders, isLoading, refetch } = useQuery({
        queryKey: ['customer-orders', searchPhone],
        queryFn: () => orderService.getByPhone(searchPhone),
        enabled: !!searchPhone,
    });

    const onSubmit = (data) => {
        setSearchPhone(data.customer_phone);
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'en_attente': return <Clock size={16} />;
            case 'acceptee': return <CheckCircle size={16} />;
            case 'refusee': return <XCircle size={16} />;
            case 'en_preparation': return <ChefHat size={16} />;
            case 'terminee': return <Package size={16} />;
            default: return <Package size={16} />;
        }
    };

    return (
        <ClientLayout>
            <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
                <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--color-muted)', textDecoration: 'none', marginBottom: 28, fontSize: '0.875rem', fontWeight: 500 }}>
                    ← Retour au menu
                </Link>

                <h1 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.8rem', marginBottom: 32 }}>
                    Mes <span className="gradient-text">Commandes</span>
                </h1>

                {/* Search Form */}
                <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 16, padding: 24, marginBottom: 32 }}>
                    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', gap: 12 }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                <Phone size={13} /> Numéro de téléphone
                            </label>
                            <input 
                                className={`input ${errors.customer_phone ? 'input-error' : ''}`} 
                                placeholder="06 00 00 00 00" 
                                {...register('customer_phone')}
                                style={{ fontSize: '1rem' }}
                            />
                            {errors.customer_phone && (
                                <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: 4 }}>
                                    {errors.customer_phone.message}
                                </p>
                            )}
                        </div>
                        <button 
                            type="submit" 
                            className="btn btn-primary" 
                            style={{ alignSelf: 'flex-end', minWidth: 140 }}
                        >
                            <Search size={18} />
                            Rechercher
                        </button>
                    </form>
                </div>

                {/* Orders List */}
                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <div className="skeleton" style={{ width: 60, height: 60, borderRadius: '50%', margin: '0 auto 20px' }}></div>
                        <p style={{ color: 'var(--color-muted)' }}>Chargement des commandes...</p>
                    </div>
                ) : orders?.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-muted)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: 16 }}>📦</div>
                        <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.2rem', marginBottom: 8 }}>
                            Aucune commande trouvée
                        </h3>
                        <p style={{ marginBottom: 24 }}>
                            Aucune commande n'a été trouvée pour ce numéro de téléphone.
                        </p>
                        <Link to="/" className="btn btn-primary">
                            Commander maintenant
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {orders?.map((order) => (
                            <div 
                                key={order.id}
                                style={{ 
                                    background: 'var(--color-surface)', 
                                    border: '1px solid var(--color-border)', 
                                    borderRadius: 16, 
                                    padding: 20 
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: 4 }}>
                                            Commande #{order.id}
                                        </div>
                                        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                                            {new Date(order.created_at).toLocaleDateString('fr-FR', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <StatusBadge status={order.status} />
                                        <Link 
                                            to={`/commande/${order.id}`}
                                            className="btn btn-ghost"
                                            style={{ fontSize: '0.875rem' }}
                                        >
                                            Voir détails →
                                        </Link>
                                    </div>
                                </div>

                                {/* Order Items Summary */}
                                <div style={{ 
                                    borderTop: '1px solid var(--color-border)', 
                                    paddingTop: 16,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                        {getStatusIcon(order.status)}
                                        <span style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>
                                            {order.items.length} article{order.items.length > 1 ? 's' : ''} · {order.customer_name}
                                        </span>
                                    </div>
                                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#f97316' }}>
                                        {Number(order.total_price).toFixed(2)} GNF
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </ClientLayout>
    );
}
