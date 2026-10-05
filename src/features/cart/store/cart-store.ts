"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  name: string;
  reference: string;
  slug: string;
  image?: string;
  /** Categoria del producto; permite saber si es una prenda o un complemento. */
  category?: string;
  price: number;
  quantity: number;
  color?: string;
  size?: string;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, color?: string, size?: string) => void;
  updateQuantity: (
    productId: string,
    quantity: number,
    color?: string,
    size?: string,
  ) => void;
  clear: () => void;
};

function isSameSelection(
  cartItem: Pick<CartItem, "productId" | "color" | "size">,
  productId: string,
  color?: string,
  size?: string,
) {
  return (
    cartItem.productId === productId &&
    cartItem.color === color &&
    cartItem.size === size
  );
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((cartItem) =>
            isSameSelection(cartItem, item.productId, item.color, item.size),
          );

          if (!existing) {
            return { items: [...state.items, item] };
          }

          return {
            items: state.items.map((cartItem) =>
              cartItem === existing
                ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
                : cartItem,
            ),
          };
        }),
      removeItem: (productId, color, size) =>
        set((state) => ({
          items: state.items.filter(
            (item) => !isSameSelection(item, productId, color, size),
          ),
        })),
      updateQuantity: (productId, quantity, color, size) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter(
                  (item) => !isSameSelection(item, productId, color, size),
                )
              : state.items.map((item) =>
                  isSameSelection(item, productId, color, size)
                    ? { ...item, quantity }
                    : item,
                ),
        })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "moda-selecta-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
