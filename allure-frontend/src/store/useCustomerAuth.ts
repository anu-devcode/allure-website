import { create } from "zustand";
import { persist } from "zustand/middleware";
import { customerAuthService } from "@/services/customerAuthService";

export interface CustomerUser {
    id: string;
    name: string;
    email: string;
    phone: string;
    city?: string;
    joinedAt: string;
}

interface CustomerAuthStore {
    user: CustomerUser | null;
    token: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    register: (name: string, email: string, phone: string, password: string) => Promise<boolean>;
    logout: () => void;
    updateProfile: (updates: Partial<CustomerUser>) => Promise<boolean>;
    rehydrateSession: () => Promise<void>;
}

const mapApiUserToStoreUser = (user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    city: string | null;
    joinedAt: string;
}): CustomerUser => ({
    id: user.id,
    name: user.name ?? "Customer",
    email: user.email,
    phone: user.phone ?? "",
    city: user.city ?? undefined,
    joinedAt: user.joinedAt,
});

export const useCustomerAuth = create<CustomerAuthStore>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,

            login: async (email: string, password: string) => {
                try {
                    const result = await customerAuthService.login({ email, password });
                    set({
                        user: mapApiUserToStoreUser(result.user),
                        token: result.token,
                        refreshToken: result.refreshToken,
                        isAuthenticated: true,
                    });
                    return true;
                } catch {
                    set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
                    return false;
                }
            },

            register: async (name: string, email: string, phone: string, password: string) => {
                try {
                    const result = await customerAuthService.register({ name, email, phone, password });
                    set({
                        user: mapApiUserToStoreUser(result.user),
                        token: result.token,
                        refreshToken: result.refreshToken,
                        isAuthenticated: true,
                    });
                    return true;
                } catch {
                    set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
                    return false;
                }
            },

            logout: () => {
                const refreshToken = get().refreshToken;
                if (refreshToken) {
                    void customerAuthService.logout(refreshToken);
                }
                set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
            },

            updateProfile: async (updates: Partial<CustomerUser>) => {
                const token = get().token;
                const currentUser = get().user;

                if (!token || !currentUser) {
                    return false;
                }

                try {
                    const result = await customerAuthService.updateProfile(token, {
                        name: updates.name,
                        phone: updates.phone,
                        city: updates.city,
                    });

                    set({ user: mapApiUserToStoreUser(result.user) });
                    return true;
                } catch {
                    set({ user: currentUser });
                    return false;
                }
            },

            rehydrateSession: async () => {
                const token = get().token;
                const refreshToken = get().refreshToken;
                if (!token) {
                    set({ user: null, isAuthenticated: false });
                    return;
                }

                try {
                    const result = await customerAuthService.getMe(token);
                    set({
                        user: mapApiUserToStoreUser(result.user),
                        isAuthenticated: true,
                    });
                } catch {
                    if (!refreshToken) {
                        set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
                        return;
                    }

                    try {
                        const refreshed = await customerAuthService.refresh(refreshToken);
                        set({
                            user: mapApiUserToStoreUser(refreshed.user),
                            token: refreshed.token,
                            refreshToken: refreshed.refreshToken,
                            isAuthenticated: true,
                        });
                    } catch {
                        set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
                    }
                }
            },
        }),
        {
            name: "allure-customer-auth",
        }
    )
);
