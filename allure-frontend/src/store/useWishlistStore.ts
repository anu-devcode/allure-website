import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/types";
import { wishlistService } from "@/services/wishlistService";

const createGuestId = () => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }

    return `guest_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

interface WishlistStore {
    guestId: string;
    items: Product[];
    loading: boolean;
    initialized: boolean;
    initialize: (token?: string | null) => Promise<void>;
    toggleItem: (product: Product, token?: string | null) => Promise<void>;
    removeItem: (productId: string, token?: string | null) => Promise<void>;
    syncGuestToCustomer: (token: string) => Promise<void>;
    isWishlisted: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>()(
    persist(
        (set, get) => ({
            guestId: createGuestId(),
            items: [],
            loading: false,
            initialized: false,

            initialize: async (token?: string | null) => {
                const { guestId } = get();
                set({ loading: true });
                try {
                    const items = await wishlistService.getWishlist(token, guestId);
                    set({ items, initialized: true, loading: false });
                } catch {
                    set({ items: [], initialized: true, loading: false });
                }
            },

            toggleItem: async (product: Product, token?: string | null) => {
                const { guestId, items } = get();
                const exists = items.some((item) => item.id === product.id);

                try {
                    const updatedItems = exists
                        ? await wishlistService.removeItem(product.id, token, guestId)
                        : await wishlistService.addItem(product.id, token, guestId);
                    set({ items: updatedItems });
                } catch {
                    return;
                }
            },

            removeItem: async (productId: string, token?: string | null) => {
                const { guestId } = get();
                try {
                    const updatedItems = await wishlistService.removeItem(productId, token, guestId);
                    set({ items: updatedItems });
                } catch {
                    return;
                }
            },

            syncGuestToCustomer: async (token: string) => {
                const { guestId } = get();
                try {
                    const mergedItems = await wishlistService.syncGuestToCustomer(token, guestId);
                    set({ items: mergedItems });
                } catch {
                    return;
                }
            },

            isWishlisted: (productId: string) => {
                return get().items.some((item) => item.id === productId);
            },
        }),
        {
            name: "allure-wishlist-storage",
            partialize: (state) => ({
                guestId: state.guestId,
                items: state.items,
            }),
        }
    )
);
