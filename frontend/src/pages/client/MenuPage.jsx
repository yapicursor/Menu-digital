import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { dishService } from '../../services/dishService';
import { categoryService } from '../../services/categoryService';
import ClientLayout from '../../layouts/ClientLayout';
import CategoryNav from '../../components/client/CategoryNav';
import DishCard from '../../components/client/DishCard';
import { Search, Utensils } from 'lucide-react';

const RESTAURANT_ID = import.meta.env.VITE_RESTAURANT_ID ? Number(import.meta.env.VITE_RESTAURANT_ID) : null;
const HERO_BG_URL = import.meta.env.VITE_HERO_BG_URL || 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=2000&q=80';

export default function MenuPage() {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [search, setSearch] = useState('');

    const { data: categories = [] } = useQuery({
        queryKey: ['categories', RESTAURANT_ID],
        queryFn: () => categoryService.getAll(RESTAURANT_ID || undefined),
    });

    const { data: dishes = [], isLoading } = useQuery({
        queryKey: ['dishes', RESTAURANT_ID, selectedCategory],
        queryFn: () => dishService.getAll({
            ...(RESTAURANT_ID ? { restaurant_id: RESTAURANT_ID } : {}),
            ...(selectedCategory ? { category_id: selectedCategory } : {}),
        }),
    });

    const filtered = dishes.filter((d) =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        (d.description || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <ClientLayout>
            {/* Hero Banner */}
            <div className="hero-banner" style={{
                backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.35) 55%, rgba(249,115,22,0.12) 100%), url(${HERO_BG_URL})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                borderBottom: '1px solid var(--color-border)',
                padding: '64px 24px 48px',
                minHeight: 'clamp(300px, 38vw, 520px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
            }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#f97316', fontWeight: 700, marginBottom: 12 }}>
                    🍴 Bienvenue
                </div>
                <h1 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', lineHeight: 1.2, marginBottom: 12 }}>
                    Notre <span className="gradient-text">Menu</span>
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: '1rem', maxWidth: 500, margin: '0 auto' }}>
                    Découvrez nos plats préparés avec passion et savoir-faire
                </p>
            </div>

            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
                {/* Search bar */}
                <div className="menu-search" style={{ position: 'relative', margin: '0 auto 28px', maxWidth: 480 }}>
                    <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
                    <input
                        className="input"
                        style={{ paddingLeft: 44 }}
                        placeholder="Rechercher un plat..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Category nav */}
                {categories.length > 0 && (
                    <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'center' }}>
                        <CategoryNav categories={categories} selected={selectedCategory} onSelect={setSelectedCategory} />
                    </div>
                )}

                {/* Section title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                    <Utensils size={18} color="#f97316" />
                    <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.2rem' }}>
                        {selectedCategory ? categories.find((c) => c.id === selectedCategory)?.name : 'Tous les plats'}
                    </h2>
                    <span style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>({filtered.length} plat{filtered.length !== 1 ? 's' : ''})</span>
                </div>

                {/* Skeleton */}
                {isLoading && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
                        {[...Array(6)].map((_, i) => (
                            <div key={i} style={{ borderRadius: 16, overflow: 'hidden' }}>
                                <div className="skeleton" style={{ height: 180 }} />
                                <div style={{ padding: 16, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderTop: 'none' }}>
                                    <div className="skeleton" style={{ height: 18, marginBottom: 10, width: '70%' }} />
                                    <div className="skeleton" style={{ height: 14, width: '100%' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Dishes grid */}
                {!isLoading && filtered.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-muted)' }}>
                        <Utensils size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
                        <p style={{ fontWeight: 500, fontSize: '1rem' }}>Aucun plat trouvé</p>
                    </div>
                )}

                {!isLoading && filtered.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
                        {filtered.map((dish, i) => (
                            <div key={dish.id} className="fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
                                <DishCard dish={dish} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </ClientLayout>
    );
}
