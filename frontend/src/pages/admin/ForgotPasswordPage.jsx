import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { ChefHat, Mail } from 'lucide-react';

const schema = z.object({
    email: z.string().email('Email invalide'),
});

export default function ForgotPasswordPage() {
    const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

    const mutation = useMutation({ mutationFn: authService.forgotPassword });

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div style={{ width: '100%', maxWidth: 420 }}>
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <div style={{ width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(135deg, #f97316, #ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 32px rgba(249,115,22,0.35)' }}>
                        <ChefHat size={30} color="white" />
                    </div>
                    <h1 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.8rem', marginBottom: 6 }}>
                        Mot de passe <span className="gradient-text">oublié</span>
                    </h1>
                    <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem' }}>Entrez votre email pour recevoir un lien de réinitialisation</p>
                </div>

                <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 20, padding: 32 }}>
                    {mutation.isSuccess ? (
                        <div style={{ textAlign: 'center', color: '#22c55e', fontSize: '0.95rem' }}>
                            ✅ Un email a été envoyé si ce compte existe.
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    <Mail size={13} /> Email
                                </label>
                                <input className={`input ${errors.email ? 'input-error' : ''}`} type="email" placeholder="admin@restaurant.com" {...register('email')} />
                                {errors.email && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: 4 }}>{errors.email.message}</p>}
                            </div>

                            {mutation.isError && (
                                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px', color: '#ef4444', fontSize: '0.875rem' }}>
                                    {mutation.error?.response?.data?.message || 'Erreur serveur'}
                                </div>
                            )}

                            <button type="submit" disabled={mutation.isPending} className="btn btn-primary" style={{ justifyContent: 'center', padding: '14px', fontSize: '0.95rem' }}>
                                {mutation.isPending ? 'Envoi...' : 'Envoyer le lien'}
                            </button>
                        </form>
                    )}

                    <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--color-border)', textAlign: 'center' }}>
                        <Link to="/admin/login" style={{ color: '#f97316', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
                            ← Retour à la connexion
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
