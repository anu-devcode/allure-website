"use client";

import { useEffect } from "react";
import { useCustomerAuth } from "@/store/useCustomerAuth";
import { useWishlistStore } from "@/store/useWishlistStore";

export function WishlistInitializer() {
    const token = useCustomerAuth((state) => state.token);
    const isAuthenticated = useCustomerAuth((state) => state.isAuthenticated);
    const initialize = useWishlistStore((state) => state.initialize);
    const syncGuestToCustomer = useWishlistStore((state) => state.syncGuestToCustomer);

    useEffect(() => {
        const initWishlist = async () => {
            if (isAuthenticated && token) {
                await syncGuestToCustomer(token);
                await initialize(token);
                return;
            }

            await initialize(null);
        };

        void initWishlist();
    }, [initialize, isAuthenticated, syncGuestToCustomer, token]);

    return null;
}
