import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
    persist(
        (set, get) => ({
            items: [],

            addItem: (dish) => {
                const existing = get().items.find((i) => i.id === dish.id);
                if (existing) {
                    set({
                        items: get().items.map((i) =>
                            i.id === dish.id ? { ...i, quantity: i.quantity + 1 } : i
                        ),
                    });
                } else {
                    set({ items: [...get().items, { ...dish, quantity: 1 }] });
                }
            },

            removeItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),

            updateQuantity: (id, quantity) => {
                if (quantity <= 0) {
                    set({ items: get().items.filter((i) => i.id !== id) });
                } else {
                    set({
                        items: get().items.map((i) => (i.id === id ? { ...i, quantity } : i)),
                    });
                }
            },

            clearCart: () => set({ items: [] }),

            get total() {
                return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0);
            },

            get itemCount() {
                return get().items.reduce((sum, i) => sum + i.quantity, 0);
            },
        }),
        { name: 'cart-storage' }
    )
);

export default useCartStore;
