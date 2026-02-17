import { create } from "zustand";
import { persist } from "zustand/middleware";

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
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    register: (name: string, email: string, phone: string, password: string) => Promise<boolean>;
    logout: () => void;
    updateProfile: (updates: Partial<CustomerUser>) => void;
}

export const useCustomerAuth = create<CustomerAuthStore>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,

            login: async (email: string, password: string) => {
                // Simulate API delay
                await new Promise((resolve) => setTimeout(resolve, 800));

                // Mock login — in production, validate against backend
                if (email && password.length >= 4) {
                    const mockUser: CustomerUser = {
                        id: "cust_" + Date.now(),
                        name: email.split("@")[0] || "Customer",
                        email,
                        phone: "",
                        joinedAt: new Date().toISOString(),
                    };
                    set({ user: mockUser, isAuthenticated: true });
                    return true;
                }
                return false;
            },

            register: async (name: string, email: string, phone: string, password: string) => {
                // Simulate API delay
                await new Promise((resolve) => setTimeout(resolve, 1000));

                if (name && email && phone && password.length >= 4) {
                    const newUser: CustomerUser = {
                        id: "cust_" + Date.now(),
                        name,
                        email,
                        phone,
                        joinedAt: new Date().toISOString(),
                    };
                    set({ user: newUser, isAuthenticated: true });
                    return true;
                }
                return false;
            },

            logout: () => {
                set({ user: null, isAuthenticated: false });
            },

            updateProfile: (updates: Partial<CustomerUser>) => {
                const currentUser = get().user;
                if (currentUser) {
                    set({ user: { ...currentUser, ...updates } });
                }
            },
        }),
        {
            name: "allure-customer-auth",
        }
    )
);
