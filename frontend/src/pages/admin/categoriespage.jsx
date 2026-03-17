import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '../../layouts/AdminLayout';
import { categoryService } from '../../services/categoryService';
import useAuthStore from '../../store/authStore';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({ name: z.string().min(1, 'Nom requis') });

function CategoryModal({ initial, onClose, onSave, loading }) {
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { name: initial?.name || '' },
    });
    return (
        <div className="modal-overlay">
            <div className="modal-box" style={{ padding: 28 }}>
                <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.2rem', marginBottom: 20 }}>
                    {initial ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
                </h3>
                <form onSubmit={handleSubmit(onSave)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nom</label>
                        <input className={`input ${errors.name ? 'input-error' : ''}`} placeholder="Ex: Entrées, Plats, Desserts..." {...register('name')} />
                        {errors.name && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: 4 }}>{errors.name.message}</p>}
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button type="button" onClick={onClose} className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Annuler</button>
                        <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                            {loading ? 'Sauvegarde...' : initial ? 'Modifier' : 'Créer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function CategoriesPage() {
    const qc = useQueryClient();
    const restaurant = useAuthStore((s) => s.restaurant);
    const [modal, setModal] = useState(null); // null | { cat: {} }

    const { data: categories = [], isLoading } = useQuery({
        queryKey: ['categories', restaurant?.id],
        queryFn: () => categoryService.getAll(restaurant?.id),
        enabled: !!restaurant?.id
    });

    const createMutation = useMutation({
        mutationFn: (data) => categoryService.create(data),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); setModal(null); },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => categoryService.update(id, data),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); setModal(null); },
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => categoryService.delete(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
    });

    const handleSave = (data) => {
        if (modal?.cat) updateMutation.mutate({ id: modal.cat.id, data });
        else createMutation.mutate(data);
    };

    return (
        <AdminLayout>
            {modal && (
                <CategoryModal
                    initial={modal.cat}
                    onClose={() => setModal(null)}
                    onSave={handleSave}
                    loading={createMutation.isPending || updateMutation.isPending}
                />
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.6rem' }}>Catégories</h1>
                    <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem', marginTop: 2 }}>{categories.length} catégorie{categories.length !== 1 ? 's' : ''}</p>
                </div>
                <button id="add-category-btn" onClick={() => setModal({ cat: null })} className="btn btn-primary">
                    <Plus size={16} /> Nouvelle catégorie
                </button>
            </div>

            {isLoading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 14 }}>
                    {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 76, borderRadius: 14 }} />)}
                </div>
            ) : categories.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-muted)' }}>
                    <Tag size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
                    <p style={{ fontWeight: 500 }}>Aucune catégorie</p>
                    <p style={{ fontSize: '0.85rem', marginTop: 6 }}>Créez votre première catégorie pour organiser votre menu.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 14 }}>
                    {categories.map((cat) => (
                        <div key={cat.id} className="fade-in-up" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.2s' }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(249,115,22,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                        >
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(249,115,22,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Tag size={18} color="#f97316" />
                            </div>
                            <span style={{ flex: 1, fontWeight: 600, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.name}</span>
                            <div style={{ display: 'flex', gap: 6 }}>
                                <button onClick={() => setModal({ cat })} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface-2)', color: 'var(--color-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                                    onMouseEnter={(e) => { e.currentTarget.style.color = '#f97316'; e.currentTarget.style.borderColor = 'rgba(249,115,22,0.4)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-muted)'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}>
                                    <Pencil size={13} />
                                </button>
                                <button onClick={() => window.confirm('Supprimer cette catégorie ?') && deleteMutation.mutate(cat.id)}
                                    style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}>
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </AdminLayout>
    );
}
