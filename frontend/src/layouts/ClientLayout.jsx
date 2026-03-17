import { ShoppingCart, ChefHat, Phone, Package, Menu, X } from 'lucide-react';
import useCartStore from '../store/cartStore';
import { useState } from 'react';
import CartDrawer from '../components/client/CartDrawer';
import { Link } from 'react-router-dom';

export default function ClientLayout({ children, restaurantId }) {
    const items = useCartStore((s) => s.items);
    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
    const [cartOpen, setCartOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

                {/* Desktop Navigation - Hidden on Mobile */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="desktop-nav">
                    <Link
                        to="/mes-commandes"
                        style={{
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-muted)',
                            borderRadius: 12,
                            padding: '9px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            textDecoration: 'none',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(249,115,22,0.15)';
                            e.currentTarget.style.color = '#f97316';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                            e.currentTarget.style.color = 'var(--color-muted)';
                        }}
                    >
                        <Package size={18} />
                        Mes commandes
                    </Link>
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
                </div>

                {/* Mobile Hamburger Button - Visible Only on Mobile */}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    style={{
                        display: 'none',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid var(--color-border)',
                        color: 'white',
                        borderRadius: 10,
                        padding: '8px',
                        cursor: 'pointer',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                    }}
                    className="mobile-menu-btn"
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(249,115,22,0.15)';
                        e.currentTarget.style.color = '#f97316';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                        e.currentTarget.style.color = 'white';
                    }}
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </header>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div style={{
                    position: 'fixed',
                    top: 64,
                    left: 0,
                    right: 0,
                    background: 'rgba(15,15,19,0.98)',
                    backdropFilter: 'blur(16px)',
                    borderBottom: '1px solid var(--color-border)',
                    padding: '20px',
                    zIndex: 39,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    animation: 'slideDown 0.3s ease-out',
                }} className="mobile-menu">
                    <Link
                        to="/mes-commandes"
                        onClick={() => setMobileMenuOpen(false)}
                        style={{
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-muted)',
                            borderRadius: 12,
                            padding: '14px 18px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            fontWeight: 600,
                            fontSize: '1rem',
                            textDecoration: 'none',
                            transition: 'all 0.2s',
                        }}
                    >
                        <Package size={20} />
                        Mes commandes
                    </Link>
                    <button
                        onClick={() => {
                            setCartOpen(true);
                            setMobileMenuOpen(false);
                        }}
                        style={{
                            background: itemCount > 0 ? 'linear-gradient(135deg, #f97316, #ea580c)' : 'rgba(255,255,255,0.06)',
                            border: '1px solid', borderColor: itemCount > 0 ? 'transparent' : 'var(--color-border)',
                            color: 'white',
                            borderRadius: 12,
                            padding: '14px 18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 10,
                            fontWeight: 600,
                            fontSize: '1rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            position: 'relative',
                        }}
                    >
                        <ShoppingCart size={20} />
                        Panier
                        {itemCount > 0 && (
                            <span style={{
                                background: 'white', color: '#f97316',
                                borderRadius: '50%', width: 24, height: 24,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.8rem', fontWeight: 800,
                                position: 'absolute',
                                right: 16,
                                top: '50%',
                                transform: 'translateY(-50%)',
                            }}>
                                {itemCount}
                            </span>
                        )}
                    </button>
                </div>
            )}

            {/* Content */}
            <main>{children}</main>

            {/* Cart Drawer */}
            <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
            
            {/* Add CSS for responsive behavior */}
            <style>{`
                @media (max-width: 768px) {
                    .desktop-nav {
                        display: none !important;
                    }
                    .mobile-menu-btn {
                        display: flex !important;
                    }
                }
                
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}
