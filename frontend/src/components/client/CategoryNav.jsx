export default function CategoryNav({ categories, selected, onSelect }) {
    return (
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
            <style>{`
        .cat-nav::-webkit-scrollbar { display: none; }
      `}</style>
            <div className="cat-nav" style={{ display: 'flex', gap: 10, overflowX: 'auto' }}>
                <button
                    onClick={() => onSelect(null)}
                    style={{
                        flexShrink: 0, padding: '9px 20px', borderRadius: 50,
                        border: '1px solid',
                        borderColor: selected === null ? 'transparent' : 'var(--color-border)',
                        background: selected === null ? 'linear-gradient(135deg, #f97316, #ea580c)' : 'var(--color-surface)',
                        color: selected === null ? 'white' : 'var(--color-muted)',
                        fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: selected === null ? '0 4px 14px rgba(249,115,22,0.3)' : 'none',
                        whiteSpace: 'nowrap',
                    }}
                >
                    Tous les plats
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => onSelect(cat.id)}
                        style={{
                            flexShrink: 0, padding: '9px 20px', borderRadius: 50,
                            border: '1px solid',
                            borderColor: selected === cat.id ? 'transparent' : 'var(--color-border)',
                            background: selected === cat.id ? 'linear-gradient(135deg, #f97316, #ea580c)' : 'var(--color-surface)',
                            color: selected === cat.id ? 'white' : 'var(--color-muted)',
                            fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: selected === cat.id ? '0 4px 14px rgba(249,115,22,0.3)' : 'none',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>
        </div>
    );
}
