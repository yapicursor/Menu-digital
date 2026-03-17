import { Plus, ShoppingCart } from 'lucide-react';
import useCartStore from '../../store/cartStore';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const getImageUrl = (image) => image || null;

export default function DishCard({ dish }) {
    const navigate = useNavigate();
    const addItem = useCartStore((s) => s.addItem);
    const items = useCartStore((s) => s.items);
    const [added, setAdded] = useState(false);

    const inCart = items.find((i) => i.id === dish.id);

    const handleAdd = (e) => {
        e?.stopPropagation?.();
        addItem(dish);
        setAdded(true);
        setTimeout(() => setAdded(false), 1200);
    };

    return (
        <div
            className="card dish-card"
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/plat/${dish.id}`)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') navigate(`/plat/${dish.id}`);
            }}
            style={{ display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', cursor: 'pointer', height: '100%' }}
        >
            {/* Not available ribbon */}
            {!dish.available && (
                <div style={{
                    position: 'absolute', top: 12, right: -28, zIndex: 5,
                    background: '#ef4444', color: 'white', fontSize: '0.65rem',
                    fontWeight: 700, padding: '4px 36px',
                    transform: 'rotate(45deg)', letterSpacing: '0.05em',
                }}>
                    INDISPONIBLE
                </div>
            )}

            {/* Image */}
            <div className="dish-card-media" style={{ position: 'relative', width: '100%', height: 'auto', aspectRatio: '16 / 9', background: 'var(--color-surface-2)', overflow: 'hidden', borderTopLeftRadius: 'inherit', borderTopRightRadius: 'inherit', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
                {dish.image ? (
                    <div
                        className="dish-card-img"
                        aria-label={dish.name}
                        style={{ width: '100%', height: '100%', display: 'flex' }}
                    >
                        <div
                            style={{
                                width: '50%',
                                height: '100%',
                                backgroundImage: `url(${getImageUrl(dish.image)})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'left center',
                                backgroundRepeat: 'no-repeat',
                            }}
                        />
                        <div
                            style={{
                                width: '50%',
                                height: '100%',
                                backgroundImage: `url(${getImageUrl(dish.image)})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'right center',
                                backgroundRepeat: 'no-repeat',
                            }}
                        />
                    </div>
                ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', opacity: 0.3 }}>
                        🍽️
                    </div>
                )}
                {/* Category tag */}
                {dish.category_name && (
                    <span style={{
                        position: 'absolute', bottom: 10, left: 10,
                        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
                        color: 'white', fontSize: '0.68rem', fontWeight: 600,
                        padding: '3px 10px', borderRadius: 20, letterSpacing: '0.03em',
                    }}>
                        {dish.category_name}
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="dish-card-content" style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="dish-card-title" style={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.3 }}>{dish.name}</div>
                {dish.description && (
                    <div className="dish-card-desc" style={{ color: 'var(--color-muted)', fontSize: '0.8rem', lineHeight: 1.5, flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {dish.description}
                    </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                    <span className="dish-card-price" style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.15rem', color: '#f97316' }}>
                        {Number(dish.price).toFixed(2)} GNF
                    </span>
                    <button
                        onClick={handleAdd}
                        disabled={!dish.available}
                        className="dish-card-btn"
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '8px 14px', borderRadius: 10, border: 'none',
                            background: added
                                ? 'rgba(34,197,94,0.2)'
                                : dish.available
                                    ? 'linear-gradient(135deg, #f97316, #ea580c)'
                                    : 'rgba(255,255,255,0.05)',
                            color: added ? '#22c55e' : dish.available ? 'white' : 'var(--color-muted)',
                            fontWeight: 600, fontSize: '0.8rem', cursor: dish.available ? 'pointer' : 'not-allowed',
                            transition: 'all 0.25s',
                            boxShadow: dish.available && !added ? '0 4px 14px rgba(249,115,22,0.3)' : 'none',
                        }}
                    >
                        {added ? '✓ Ajouté' : inCart ? <><ShoppingCart size={14} /> {inCart.quantity}</> : <><Plus size={14} /> Ajouter</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
