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
                padding: 'clamp(40px, 8vw, 64px) clamp(16px, 4vw, 24px) clamp(32px, 6vw, 48px)',
                minHeight: 'clamp(280px, 35vw, 480px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
            }}>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#f97316', fontWeight: 700, marginBottom: 10 }}>
                    🍴 Bienvenue
                </div>
                <h1 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 'clamp(1.6rem, 5vw, 2.8rem)', lineHeight: 1.2, marginBottom: 12 }}>
                    Notre <span className="gradient-text">Menu</span>
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: 'clamp(0.9rem, 2vw, 1rem)', maxWidth: 'min(90%, 500px)', margin: '0 auto' }}>
                    Découvrez nos plats préparés avec passion et savoir-faire
                </p>
            </div>

            <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(24px, 5vw, 32px) clamp(min(4vw, 20px))' }}>
                {/* Search bar */}
                <div className="menu-search" style={{ position: 'relative', margin: '0 auto 24px', maxWidth: 'min(90%, 480px)' }}>
                    <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
                    <input
                        className="input"
                        style={{ paddingLeft: 44, fontSize: '1rem' }}
                        placeholder="Rechercher un plat..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Category nav */}
                {categories.length > 0 && (
                    <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}>
                        <CategoryNav categories={categories} selected={selectedCategory} onSelect={setSelectedCategory} />
                    </div>
                )}

                {/* Section title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                    <Utensils size={18} color="#f97316" />
                    <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 'clamp(1rem, 3vw, 1.2rem)', flexShrink: 0 }}>
                        {selectedCategory ? categories.find((c) => c.id === selectedCategory)?.name : 'Tous les plats'}
                    </h2>
                    <span style={{ color: 'var(--color-muted)', fontSize: 'clamp(0.8rem, 2vw, 0.875rem)', whiteSpace: 'nowrap' }}>({filtered.length} plat{filtered.length !== 1 ? 's' : ''})</span>
                </div>

                {/* Skeleton */}
                {isLoading && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))', gap: 16 }}>
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

                {/* Empty state */}
                {!isLoading && filtered.length === 0 && (
                    <div style={{ textAlign: 'center', padding: 'clamp(40px, 8vw, 60px) clamp(20px)', color: 'var(--color-muted)' }}>
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
