import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@merch-band/shared';

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) => i.variantId === newItem.variantId
          );

          if (existingIndex > -1) {
            const updated = [...state.items];
            const current = updated[existingIndex];
            const nextQty = Math.min(
              current.quantity + newItem.quantity,
              newItem.maxStock || 99
            );
            updated[existingIndex] = { ...current, quantity: nextQty };
            return { items: updated };
          }

          return { items: [...state.items, newItem] };
        });
      },

      updateQuantity: (variantId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((i) => i.variantId !== variantId) };
          }
          return {
            items: state.items.map((i) => {
              if (i.variantId === variantId) {
                const nextQty = Math.min(quantity, i.maxStock || 99);
                return { ...i, quantity: nextQty };
              }
              return i;
            })
          };
        });
      },

      removeItem: (variantId) => {
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId)
        }));
      },

      clearCart: () => set({ items: [] }),

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      }
    }),
    {
      name: 'voidrose_cart'
    }
  )
);
