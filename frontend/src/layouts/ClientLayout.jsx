import { ShoppingCart, ChefHat, Phone } from 'lucide-react';
import useCartStore from '../store/cartStore';
import { useState } from 'react';
import CartDrawer from '../components/client/CartDrawer';

export default function ClientLayout({ children, restaurantId }) {
    const items = useCartStore((s) => s.items);
    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
    const [cartOpen, setCartOpen] = useState(false);

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
            {/* Header */}
            <header style={{
                position: 'sticky', top: 0, zIndex: 40,
                background: 'rgba(15,15,19,0.85)', backdropFilter: 'blur(16px)',
                borderBottom: '1px solid var(--color-border)',
                padding: '0 24px', height: 64,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 38, height: 38, borderRadius: 10,
                        background: 'linear-gradient(135deg, #f97316, #ea580c)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <ChefHat size={18} color="white" />
                    </div>
                    <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.1rem' }}>
                        Menu<span className="gradient-text">Digital</span>
                    </span>
                </div>

                {/* Cart button */}
                <button
                    onClick={() => setCartOpen(true)}
                    style={{
                        position: 'relative',
                        background: itemCount > 0 ? 'linear-gradient(135deg, #f97316, #ea580c)' : 'rgba(255,255,255,0.06)',
                        border: '1px solid', borderColor: itemCount > 0 ? 'transparent' : 'var(--color-border)',
                        color: 'white', borderRadius: 12,
                        padding: '9px 16px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 8,
                        fontWeight: 600, fontSize: '0.875rem',
                        transition: 'all 0.2s',
                        boxShadow: itemCount > 0 ? '0 4px 20px rgba(249,115,22,0.35)' : 'none',
                    }}
                >
                    <ShoppingCart size={18} />
                    Panier
                    {itemCount > 0 && (
                        <span style={{
                            background: 'white', color: '#f97316',
                            borderRadius: '50%', width: 20, height: 20,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.7rem', fontWeight: 800,
                        }}>
                            {itemCount}
                        </span>
                    )}
                </button>
            </header>

            {/* Content */}
            <main>{children}</main>

            {/* Cart Drawer */}
            <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
        </div>
    );
}
