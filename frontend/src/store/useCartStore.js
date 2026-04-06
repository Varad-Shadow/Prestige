import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
    items: [], // Array of { product(object), quantity }
    
    addItem: (productToAdd) => set((state) => {
        const existingItem = state.items.find(item => item.product._id === productToAdd._id);
        if (existingItem) {
            return {
                items: state.items.map(item =>
                    item.product._id === productToAdd._id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            };
        } else {
            return { items: [...state.items, { product: productToAdd, quantity: 1 }] };
        }
    }),
    
    removeItem: (productId) => set((state) => ({
        items: state.items.filter(item => item.product._id !== productId)
    })),
    
    clearCart: () => set({ items: [] }),
    
    // Computed property function
    getCartSubtotal: () => {
        const { items } = get();
        return items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    }
}));
