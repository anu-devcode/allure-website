import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/types";

export interface CartItem extends Product {
    quantity: number;
    selectedOptions?: { [key: string]: string };
}

interface CartStore {
    items: CartItem[];
    isCartOpen: boolean;
    addItem: (product: Product, quantity?: number, options?: { [key: string]: string }) => void;
    removeItem: (productId: string, options?: { [key: string]: string }) => void;
    updateQuantity: (productId: string, quantity: number, options?: { [key: string]: string }) => void;
    clearCart: () => void;
    setCartOpen: (open: boolean) => void;
    getTotalPrice: () => number;
    getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            isCartOpen: false,
            addItem: (product, quantity = 1, options) => {
                const items = get().items;
                const existingItemIndex = items.findIndex(
                    (item) => item.id === product.id && JSON.stringify(item.selectedOptions) === JSON.stringify(options)
                );

                if (existingItemIndex > -1) {
                    const newItems = [...items];
                    const item = newItems[existingItemIndex]!;
                    newItems[existingItemIndex] = { ...item, quantity: item.quantity + quantity };
                    set({ items: newItems, isCartOpen: true });
                } else {
                    set({ items: [...items, { ...product, quantity, selectedOptions: options }], isCartOpen: true });
                }
            },
            removeItem: (productId, options) => {
                set({
                    items: get().items.filter(
                        (item) => !(item.id === productId && JSON.stringify(item.selectedOptions) === JSON.stringify(options))
                    )
                });
            },
            updateQuantity: (productId, quantity, options) => {
                set({
                    items: get().items.map((item) =>
                        (item.id === productId && JSON.stringify(item.selectedOptions) === JSON.stringify(options))
                            ? { ...item, quantity: Math.max(1, quantity) }
                            : item
                    ),
                });
            },
            clearCart: () => set({ items: [] }),
            setCartOpen: (open) => set({ isCartOpen: open }),
            getTotalPrice: () => {
                return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
            },
            getItemCount: () => {
                return get().items.reduce((total, item) => total + item.quantity, 0);
            },
        }),
        {
            name: "allure-cart-storage",
        }
    )
);
