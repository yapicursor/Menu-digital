import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '../../layouts/AdminLayout';
import { dishService } from '../../services/dishService';
import { categoryService } from '../../services/categoryService';
import useAuthStore from '../../store/authStore';
import { orderService } from '../../services/orderService';
import TrendBadge from '../../components/TrendBadge';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Utensils, Search } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';


const schema = z.object({
    name: z.string().min(1, 'Nom requis'),
    price: z.string().min(1, 'Prix requis'),
    description: z.string().optional(),
    category_id: z.string().optional(),
    available: z.boolean().optional(),
});

function DishModal({ initial, categories, onClose, onSave, loading }) {
    const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            name: initial?.name || '',
            price: initial?.price?.toString() || '',
            description: initial?.description || '',
            category_id: initial?.category_id?.toString() || '',
            available: initial?.available !== undefined ? Boolean(initial.available) : true,
        },
    });
    const [preview, setPreview] = useState(initial?.image ? initial.image : null);
    const [file, setFile] = useState(null);
    const available = watch('available');

    const handleFile = (e) => {
        const f = e.target.files[0];
        if (f) { setFile(f); setPreview(URL.createObjectURL(f)); }
    };

    const handleFormSubmit = (data) => {
        const fd = new FormData();
        Object.entries(data).forEach(([k, v]) => { if (v !== undefined && v !== '') fd.append(k, v); });
        if (file) fd.append('image', file);
        onSave(fd);
    };

    return (
        <div className="modal-overlay" style={{ alignItems: 'flex-start', paddingTop: 40, overflow: 'auto' }}>
            <div className="modal-box" style={{ padding: 28, maxHeight: '90vh', overflowY: 'auto' }}>
                <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.2rem', marginBottom: 20 }}>
                    {initial ? 'Modifier le plat' : 'Nouveau plat'}
                </h3>
                <form onSubmit={handleSubmit(handleFormSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Image upload */}
                    <div>
                        <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-muted)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Image</label>
                        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--color-border)', borderRadius: 12, padding: 16, cursor: 'pointer', transition: 'border-color 0.2s', minHeight: 120 }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#f97316'}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
                        >
                            {preview ? (
                                <img src={preview} alt="preview" style={{ height: 100, objectFit: 'cover', borderRadius: 8 }} />
                            ) : (
                                <div style={{ textAlign: 'center', color: 'var(--color-muted)' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: 6 }}>📷</div>
                                    <div style={{ fontSize: '0.8rem' }}>Cliquer pour choisir une image</div>
                                    <div style={{ fontSize: '0.72rem', marginTop: 2 }}>JPG, PNG, WebP (max 5 MB)</div>
                                </div>
                            )}
                            <input type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
                        </label>
                    </div>

                    {/* Name */}
                    <div>
                        <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nom *</label>
                        <input className={`input ${errors.name ? 'input-error' : ''}`} placeholder="Ex: Couscous royal" {...register('name')} />
                        {errors.name && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: 4 }}>{errors.name.message}</p>}
                    </div>

                    {/* Price + Category */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Prix (GNF) *</label>
                            <input className={`input ${errors.price ? 'input-error' : ''}`} type="number" step="0.01" min="0" placeholder="0.00" {...register('price')} />
                            {errors.price && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: 4 }}>{errors.price.message}</p>}
                        </div>
                        <div>
                            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Catégorie</label>
                            <select className="input" {...register('category_id')}>
                                <option value="">— Aucune —</option>
                                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</label>
                        <textarea className="input" rows={3} placeholder="Décrivez votre plat..." {...register('description')} style={{ resize: 'none' }} />
                    </div>

                    {/* Available toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button type="button" onClick={() => setValue('available', !available)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: available ? '#22c55e' : 'var(--color-muted)', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: '0.875rem' }}>
                            {available ? <ToggleRight size={28} color="#22c55e" /> : <ToggleLeft size={28} />}
                            {available ? 'Disponible' : 'Indisponible'}
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                        <button type="button" onClick={onClose} className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Annuler</button>
                        <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                            {loading ? 'Sauvegarde...' : initial ? 'Modifier' : 'Créer le plat'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function DishesPage() {
    const qc = useQueryClient();
    const restaurant = useAuthStore((s) => s.restaurant);
    const [modal, setModal] = useState(null);
    const [search, setSearch] = useState('');

    const { data: stats } = useQuery({
        queryKey: ['stats'],
        queryFn: orderService.getStats,
        refetchInterval: 30000,
    });

    const { data: dishes = [], isLoading } = useQuery({
        queryKey: ['dishes-admin', restaurant?.id],
        queryFn: () => dishService.getAll({ restaurant_id: restaurant?.id }),
        enabled: !!restaurant?.id,
    });

    const { data: categories = [] } = useQuery({
        queryKey: ['categories', restaurant?.id],
        queryFn: () => categoryService.getAll(restaurant?.id),
        enabled: !!restaurant?.id,
    });

    const createMutation = useMutation({
        mutationFn: dishService.create,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['dishes-admin', restaurant?.id] }); setModal(null); },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, fd }) => dishService.update(id, fd),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['dishes-admin', restaurant?.id] }); setModal(null); },
    });

    const deleteMutation = useMutation({
        mutationFn: dishService.delete,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['dishes-admin', restaurant?.id] }),
    });

    const toggleMutation = useMutation({
        mutationFn: dishService.toggle,
        onSuccess: (updatedDish) => {
            qc.setQueryData(['dishes-admin', restaurant?.id], (old) => {
                if (!Array.isArray(old)) return old;
                return old.map((d) => (d.id === updatedDish.id ? { ...d, available: updatedDish.available } : d));
            });
            qc.invalidateQueries({ queryKey: ['dishes-admin', restaurant?.id] });
        },
    });

    const handleSave = (fd) => {
        if (modal?.dish) updateMutation.mutate({ id: modal.dish.id, fd });
        else createMutation.mutate(fd);
    };

    const filtered = dishes.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <AdminLayout>
            {modal && (
                <DishModal
                    initial={modal.dish}
                    categories={categories}
                    onClose={() => setModal(null)}
                    onSave={handleSave}
                    loading={createMutation.isPending || updateMutation.isPending}
                />
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.6rem' }}>Plats</h1>
                    <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem', marginTop: 2 }}>{dishes.length} plat{dishes.length !== 1 ? 's' : ''}</p>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
                        <input className="input" style={{ paddingLeft: 38, width: 200 }} placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <button id="add-dish-btn" onClick={() => setModal({ dish: null })} className="btn btn-primary">
                        <Plus size={16} /> Nouveau plat
                    </button>
                </div>
            </div>

            {/* Grid */}
            {isLoading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
                    {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 280, borderRadius: 16 }} />)}
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-muted)' }}>
                    <Utensils size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
                    <p style={{ fontWeight: 500 }}>Aucun plat trouvé</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
                    {filtered.map((dish) => (
                        <div key={dish.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                            {/* Image */}
                            <div style={{ height: 190, background: 'var(--color-surface-2)', position: 'relative', overflow: 'hidden' }}>
                                {dish.image ? (
                                    <div aria-label={dish.name} style={{ width: '100%', height: '100%', display: 'flex' }}>
                                        <div
                                            style={{
                                                width: '50%',
                                                height: '100%',
                                                backgroundImage: `url(${dish.image})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'left center',
                                                backgroundRepeat: 'no-repeat',
                                            }}
                                        />
                                        <div
                                            style={{
                                                width: '50%',
                                                height: '100%',
                                                backgroundImage: `url(${dish.image})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'right center',
                                                backgroundRepeat: 'no-repeat',
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', opacity: 0.3 }}>🍽️</div>
                                )}
                                {/* Available toggle overlay */}
                                <button
                                    onClick={() => toggleMutation.mutate(dish.id)}
                                    style={{ position: 'absolute', top: 10, right: 10, background: dish.available ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)', border: '1px solid', borderColor: dish.available ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)', borderRadius: 20, padding: '4px 10px', color: dish.available ? '#22c55e' : '#ef4444', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', backdropFilter: 'blur(8px)' }}
                                >
                                    {dish.available ? '● Dispo' : '○ Indispo'}
                                </button>
                            </div>
                            {/* Info */}
                            <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{dish.name}</div>
                                {dish.category_name && <div style={{ fontSize: '0.73rem', color: '#f97316', fontWeight: 600 }}>{dish.category_name}</div>}
                                {dish.description && <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{dish.description}</div>}
                                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f97316', marginTop: 'auto', paddingTop: 8 }}>{Number(dish.price).toFixed(2)} GNF</div>
                            </div>
                            {/* Actions */}
                            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: 8 }}>
                                <button onClick={() => setModal({ dish })} className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center', padding: '8px' }}>
                                    <Pencil size={14} /> Modifier
                                </button>
                                <button onClick={() => window.confirm('Supprimer ce plat ?') && deleteMutation.mutate(dish.id)} className="btn btn-danger" style={{ padding: '8px 12px' }}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </AdminLayout>
    );
}
