import { create } from 'zustand';

export interface FlyItemEvent {
  id: string;
  startX: number;
  startY: number;
  imageUrl?: string;
  title?: string;
}

interface FlyCartState {
  flyingItems: FlyItemEvent[];
  isCartBumping: boolean;
  triggerFly: (startX: number, startY: number, imageUrl?: string, title?: string) => void;
  removeFly: (id: string) => void;
  triggerCartBump: () => void;
}

export const useFlyCartStore = create<FlyCartState>((set) => ({
  flyingItems: [],
  isCartBumping: false,

  triggerFly: (startX: number, startY: number, imageUrl?: string, title?: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    set((state) => ({
      flyingItems: [...state.flyingItems, { id, startX, startY, imageUrl, title }]
    }));
  },

  removeFly: (id: string) => {
    set((state) => ({
      flyingItems: state.flyingItems.filter((item) => item.id !== id)
    }));
  },

  triggerCartBump: () => {
    set({ isCartBumping: true });
    setTimeout(() => {
      set({ isCartBumping: false });
    }, 450);
  }
}));
