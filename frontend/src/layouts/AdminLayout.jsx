import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Utensils, ClipboardList, Tag, LogOut, ChefHat, Menu, X, BarChart3, UserCircle } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { useState } from 'react';

const navItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
    { path: '/admin/stats', icon: BarChart3, label: 'Statistiques' },
    { path: '/admin/dishes', icon: Utensils, label: 'Plats' },
    { path: '/admin/categories', icon: Tag, label: 'Catégories' },
    { path: '/admin/orders', icon: ClipboardList, label: 'Commandes' },
    { path: '/admin/profile', icon: UserCircle, label: 'Mon profil' },
];

export default function AdminLayout({ children }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { restaurant, logout } = useAuthStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => { await logout(); navigate('/admin/login'); };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40 }}
                />
            )}

            {/* Sidebar */}
            <aside style={{
                width: 240, flexShrink: 0,
                background: 'var(--color-surface)',
                borderRight: '1px solid var(--color-border)',
                display: 'flex', flexDirection: 'column',
                position: 'fixed', top: 0, left: sidebarOpen ? 0 : -240,
                height: '100%', zIndex: 50,
                transition: 'left 0.3s ease',
            }}
                className="lg-sidebar"
            >
                {/* Logo */}
                <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: 10,
                            background: 'linear-gradient(135deg, #f97316, #ea580c)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <ChefHat size={20} color="white" />
                        </div>
                        <div>
                            <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)' }}>
                                MenuDigital
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--color-muted)', marginTop: 1 }}>
                                Admin Panel
                            </div>
                        </div>
                    </div>
                </div>

                {/* Restaurant name */}
                {restaurant && (
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Restaurant</div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {restaurant.name}
                        </div>
                    </div>
                )}

                {/* Nav */}
                <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {navItems.map(({ path, icon: Icon, label }) => {
                        const active = location.pathname === path;
                        return (
                            <Link
                                key={path}
                                to={path}
                                onClick={() => setSidebarOpen(false)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 12,
                                    padding: '10px 12px', borderRadius: 10,
                                    textDecoration: 'none', fontWeight: 500, fontSize: '0.875rem',
                                    transition: 'all 0.2s',
                                    background: active ? 'rgba(249,115,22,0.15)' : 'transparent',
                                    color: active ? '#f97316' : 'var(--color-muted)',
                                    borderLeft: active ? '3px solid #f97316' : '3px solid transparent',
                                }}
                            >
                                <Icon size={18} />
                                {label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div style={{ padding: '12px 10px', borderTop: '1px solid var(--color-border)' }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            width: '100%', padding: '10px 12px', borderRadius: 10,
                            border: 'none', background: 'transparent',
                            color: '#ef4444', fontWeight: 500, fontSize: '0.875rem',
                            cursor: 'pointer', transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        <LogOut size={18} />
                        Déconnexion
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div style={{ flex: 1, marginLeft: 0, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                {/* Top bar */}
                <header style={{
                    position: 'sticky', top: 0, zIndex: 30,
                    background: 'rgba(26,26,36,0.9)', backdropFilter: 'blur(12px)',
                    borderBottom: '1px solid var(--color-border)',
                    padding: '0 24px', height: 64,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        style={{ background: 'none', border: 'none', color: 'var(--color-text)', cursor: 'pointer', padding: 8, borderRadius: 8 }}
                    >
                        {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>
                        {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                </header>

                {/* Page content */}
                <main style={{ flex: 1, padding: '24px', overflow: 'auto' }}>
                    {children}
                </main>
            </div>

            <style>{`
        @media (min-width: 1024px) {
          .lg-sidebar { left: 0 !important; }
          main { margin-left: 240px; }
          header > button { display: none; }
        }
      `}</style>
        </div>
    );
}
