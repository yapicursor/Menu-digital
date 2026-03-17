import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { authService } from '../../services/authService';
import { ChefHat, Mail, Lock, User, Phone, MapPin } from 'lucide-react';

const schema = z.object({
    name: z.string().min(2, 'Nom requis'),
    email: z.string().email('Email invalide'),
    password: z.string().min(6, 'Minimum 6 caractères'),
    phone: z.string().optional(),
    address: z.string().optional(),
});

export default function RegisterPage() {
    const navigate = useNavigate();
    const login = useAuthStore((s) => s.setSession);

    const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

    const mutation = useMutation({
        mutationFn: (data) => authService.register(data),
        onSuccess: ({ session, restaurant }) => {
            login(session, restaurant);
            navigate('/admin/dashboard');
        },
    });

    const fields = [
        { name: 'name', label: 'Nom du restaurant', icon: User, placeholder: 'La Bonne Table', type: 'text', required: true },
        { name: 'email', label: 'Email', icon: Mail, placeholder: 'contact@restaurant.com', type: 'email', required: true },
        { name: 'password', label: 'Mot de passe', icon: Lock, placeholder: '••••••••', type: 'password', required: true },
        { name: 'phone', label: 'Téléphone', icon: Phone, placeholder: '06 00 00 00 00', type: 'text', required: false },
        { name: 'address', label: 'Adresse', icon: MapPin, placeholder: '12 rue de la paix, Casablanca', type: 'text', required: false },
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div style={{ width: '100%', maxWidth: 440 }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ width: 60, height: 60, borderRadius: 16, background: 'linear-gradient(135deg,#f97316,#ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 8px 28px rgba(249,115,22,0.3)' }}>
                        <ChefHat size={26} color="white" />
                    </div>
                    <h1 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.6rem' }}>Créer votre restaurant</h1>
                    <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem', marginTop: 6 }}>Rejoignez MenuDigital dès aujourd'hui</p>
                </div>

                <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 20, padding: 28 }}>
                    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {fields.map(({ name, label, icon: Icon, placeholder, type }) => (
                            <div key={name}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    <Icon size={12} /> {label}
                                </label>
                                <input className={`input ${errors[name] ? 'input-error' : ''}`} type={type} placeholder={placeholder} {...register(name)} />
                                {errors[name] && <p style={{ color: '#ef4444', fontSize: '0.72rem', marginTop: 3 }}>{errors[name].message}</p>}
                            </div>
                        ))}

                        {mutation.isError && (
                            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px', color: '#ef4444', fontSize: '0.85rem' }}>
                                {mutation.error?.response?.data?.message || 'Erreur lors de la création'}
                            </div>
                        )}

                        <button type="submit" disabled={mutation.isPending} className="btn btn-primary" style={{ justifyContent: 'center', padding: '13px', marginTop: 4 }}>
                            {mutation.isPending ? 'Création...' : 'Créer mon restaurant'}
                        </button>
                    </form>

                    <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--color-border)', textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-muted)' }}>
                        Déjà inscrit ?{' '}
                        <Link to="/admin/login" style={{ color: '#f97316', textDecoration: 'none', fontWeight: 600 }}>Se connecter</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
