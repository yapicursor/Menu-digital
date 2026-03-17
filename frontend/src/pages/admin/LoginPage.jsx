import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { authService } from '../../services/authService';
import { ChefHat, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

const schema = z.object({
    email: z.string().email('Email invalide'),
    password: z.string().min(4, 'Mot de passe requis'),
});

export default function LoginPage() {
    const navigate = useNavigate();
    const login = useAuthStore((s) => s.setSession);
    const [showPwd, setShowPwd] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

    const mutation = useMutation({
        mutationFn: authService.login,
        onSuccess: ({ session, restaurant }) => {
            console.log('Login success:', session, restaurant);
            login(session, restaurant);
            navigate('/admin/dashboard');
        },
        onError: (err) => {
            console.error('Login error:', err);
        },
    });

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            {/* Background glow */}
            <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <div style={{ width: '100%', maxWidth: 420 }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <div style={{ width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(135deg, #f97316, #ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 32px rgba(249,115,22,0.35)' }}>
                        <ChefHat size={30} color="white" />
                    </div>
                    <h1 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.8rem', marginBottom: 6 }}>
                        Menu<span className="gradient-text">Digital</span>
                    </h1>
                    <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem' }}>Connectez-vous à votre espace restaurant</p>
                </div>

                {/* Card */}
                <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 20, padding: 32 }}>
                    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                        {/* Email */}
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                <Mail size={13} /> Email
                            </label>
                            <input
                                className={`input ${errors.email ? 'input-error' : ''}`}
                                type="email"
                                placeholder="admin@restaurant.com"
                                id="login-email"
                                {...register('email')}
                            />
                            {errors.email && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: 4 }}>{errors.email.message}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                <Lock size={13} /> Mot de passe
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    className={`input ${errors.password ? 'input-error' : ''}`}
                                    type={showPwd ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    id="login-password"
                                    style={{ paddingRight: 44 }}
                                    {...register('password')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPwd(!showPwd)}
                                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-muted)', cursor: 'pointer' }}
                                >
                                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.password && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: 4 }}>{errors.password.message}</p>}
                        </div>

                        {/* Error */}
                        {mutation.isError && (
                            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px', color: '#ef4444', fontSize: '0.875rem' }}>
                                {mutation.error?.response?.data?.message || 'Identifiants incorrects'}
                            </div>
                        )}

                        <button type="submit" id="login-submit" disabled={mutation.isPending} className="btn btn-primary" style={{ justifyContent: 'center', padding: '14px', fontSize: '0.95rem', marginTop: 4 }}>
                            {mutation.isPending ? 'Connexion...' : 'Se connecter'}
                        </button>
                    </form>

                    <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--color-border)', textAlign: 'center' }}>
                        <Link to="/admin/forgot-password" style={{ color: '#f97316', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
                            Mot de passe oublié ?
                        </Link>
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: 20 }}>
                    <Link to="/" style={{ color: 'var(--color-muted)', textDecoration: 'none', fontSize: '0.8rem' }}>← Voir le menu client</Link>
                </div>
            </div>
        </div>
    );
}
