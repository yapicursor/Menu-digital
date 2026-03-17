import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { ChefHat, Lock, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

const schema = z.object({
    password: z.string().min(6, 'Minimum 6 caractères'),
    confirm: z.string(),
}).refine((d) => d.password === d.confirm, { message: 'Les mots de passe ne correspondent pas', path: ['confirm'] });

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const [showPwd, setShowPwd] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

    const mutation = useMutation({
        mutationFn: (data) => authService.resetPassword({ password: data.password }),
        onSuccess: () => setTimeout(() => navigate('/admin/login'), 2000),
    });

    // Supabase met le token dans le hash de l'URL, pas besoin de le passer manuellement
    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div style={{ width: '100%', maxWidth: 420 }}>
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <div style={{ width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(135deg, #f97316, #ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 32px rgba(249,115,22,0.35)' }}>
                        <ChefHat size={30} color="white" />
                    </div>
                    <h1 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.8rem', marginBottom: 6 }}>
                        Nouveau <span className="gradient-text">mot de passe</span>
                    </h1>
                </div>

                <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 20, padding: 32 }}>
                    {mutation.isSuccess ? (
                        <div style={{ textAlign: 'center', color: '#22c55e', fontSize: '0.95rem' }}>
                            ✅ Mot de passe modifié. Redirection...
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    <Lock size={13} /> Nouveau mot de passe
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input className={`input ${errors.password ? 'input-error' : ''}`} type={showPwd ? 'text' : 'password'} placeholder="••••••••" style={{ paddingRight: 44 }} {...register('password')} />
                                    <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-muted)', cursor: 'pointer' }}>
                                        {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {errors.password && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: 4 }}>{errors.password.message}</p>}
                            </div>

                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    <Lock size={13} /> Confirmer
                                </label>
                                <input className={`input ${errors.confirm ? 'input-error' : ''}`} type={showPwd ? 'text' : 'password'} placeholder="••••••••" {...register('confirm')} />
                                {errors.confirm && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: 4 }}>{errors.confirm.message}</p>}
                            </div>

                            {mutation.isError && (
                                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px', color: '#ef4444', fontSize: '0.875rem' }}>
                                    {mutation.error?.response?.data?.message || 'Lien invalide ou expiré'}
                                </div>
                            )}

                            <button type="submit" disabled={mutation.isPending} className="btn btn-primary" style={{ justifyContent: 'center', padding: '14px', fontSize: '0.95rem' }}>
                                {mutation.isPending ? 'Enregistrement...' : 'Réinitialiser'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
