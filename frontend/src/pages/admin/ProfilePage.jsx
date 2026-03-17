import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../../services/authService';
import useAuthStore from '../../store/authStore';
import AdminLayout from '../../layouts/AdminLayout';
import { User, Mail, Phone, MapPin, Lock, Eye, EyeOff, Save } from 'lucide-react';
import { useState } from 'react';

const profileSchema = z.object({
    name: z.string().min(2, 'Nom requis'),
    phone: z.string().optional(),
    address: z.string().optional(),
});

const passwordSchema = z.object({
    current_password: z.string().min(1, 'Requis'),
    new_password: z.string().min(6, 'Minimum 6 caractères'),
    confirm_password: z.string(),
}).refine((d) => d.new_password === d.confirm_password, { message: 'Les mots de passe ne correspondent pas', path: ['confirm_password'] });

export default function ProfilePage() {
    const { restaurant, setSession, session } = useAuthStore();
    const queryClient = useQueryClient();
    const [showPwd, setShowPwd] = useState(false);

    const { data: profile } = useQuery({
        queryKey: ['me'],
        queryFn: authService.getMe,
        initialData: restaurant,
    });

    const profileForm = useForm({
        resolver: zodResolver(profileSchema),
        values: { name: profile?.name || '', phone: profile?.phone || '', address: profile?.address || '' },
    });

    const passwordForm = useForm({ resolver: zodResolver(passwordSchema) });

    const profileMutation = useMutation({
        mutationFn: authService.updateProfile,
        onSuccess: (data) => {
            setSession(session, data.restaurant);
            queryClient.invalidateQueries(['me']);
        },
    });

    const passwordMutation = useMutation({
        mutationFn: authService.updatePassword,
        onSuccess: () => passwordForm.reset(),
    });

    const inputStyle = { width: '100%', boxSizing: 'border-box' };

    return (
        <AdminLayout>
            <div style={{ maxWidth: 600, margin: '0 auto', padding: '32px 24px' }}>
                <h1 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.8rem', marginBottom: 32 }}>
                    Mon <span className="gradient-text">Profil</span>
                </h1>

                {/* Profile form */}
                <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 16, padding: 28, marginBottom: 24 }}>
                    <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 20, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Informations</h2>
                    <form onSubmit={profileForm.handleSubmit((d) => profileMutation.mutate(d))} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                <User size={13} /> Nom du restaurant
                            </label>
                            <input className={`input ${profileForm.formState.errors.name ? 'input-error' : ''}`} style={inputStyle} {...profileForm.register('name')} />
                            {profileForm.formState.errors.name && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: 4 }}>{profileForm.formState.errors.name.message}</p>}
                        </div>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                <Phone size={13} /> Téléphone
                            </label>
                            <input className="input" style={inputStyle} {...profileForm.register('phone')} />
                        </div>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                <MapPin size={13} /> Adresse
                            </label>
                            <input className="input" style={inputStyle} {...profileForm.register('address')} />
                        </div>

                        {profileMutation.isSuccess && <p style={{ color: '#22c55e', fontSize: '0.85rem' }}>✅ Profil mis à jour</p>}
                        {profileMutation.isError && <p style={{ color: '#ef4444', fontSize: '0.85rem' }}>{profileMutation.error?.response?.data?.message || 'Erreur'}</p>}

                        <button type="submit" disabled={profileMutation.isPending} className="btn btn-primary" style={{ justifyContent: 'center', gap: 8 }}>
                            <Save size={15} /> {profileMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                    </form>
                </div>

                {/* Password form */}
                <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 16, padding: 28 }}>
                    <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 20, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Changer le mot de passe</h2>
                    <form onSubmit={passwordForm.handleSubmit((d) => passwordMutation.mutate(d))} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {['current_password', 'new_password', 'confirm_password'].map((field, i) => (
                            <div key={field}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    <Lock size={13} /> {i === 0 ? 'Mot de passe actuel' : i === 1 ? 'Nouveau mot de passe' : 'Confirmer'}
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input className={`input ${passwordForm.formState.errors[field] ? 'input-error' : ''}`} style={{ ...inputStyle, paddingRight: 44 }} type={showPwd ? 'text' : 'password'} placeholder="••••••••" {...passwordForm.register(field)} />
                                    {i === 0 && (
                                        <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-muted)', cursor: 'pointer' }}>
                                            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    )}
                                </div>
                                {passwordForm.formState.errors[field] && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: 4 }}>{passwordForm.formState.errors[field].message}</p>}
                            </div>
                        ))}

                        {passwordMutation.isSuccess && <p style={{ color: '#22c55e', fontSize: '0.85rem' }}>✅ Mot de passe modifié</p>}
                        {passwordMutation.isError && <p style={{ color: '#ef4444', fontSize: '0.85rem' }}>{passwordMutation.error?.response?.data?.message || 'Erreur'}</p>}

                        <button type="submit" disabled={passwordMutation.isPending} className="btn btn-primary" style={{ justifyContent: 'center', gap: 8 }}>
                            <Save size={15} /> {passwordMutation.isPending ? 'Enregistrement...' : 'Modifier le mot de passe'}
                        </button>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
