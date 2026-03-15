export function StatusBadge({ status }) {
    const map = {
        en_attente: { label: 'En attente', cls: 'badge-pending' },
        acceptee: { label: 'Acceptée', cls: 'badge-accepted' },
        refusee: { label: 'Refusée', cls: 'badge-refused' },
        en_preparation: { label: 'En préparation', cls: 'badge-prep' },
        terminee: { label: 'Terminée', cls: 'badge-done' },
    };
    const { label, cls } = map[status] || { label: status, cls: 'badge-pending' };
    return <span className={`badge ${cls}`}>{label}</span>;
}
