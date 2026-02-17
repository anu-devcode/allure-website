import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminUser {
    id: string;
    username: string;
    role: 'superadmin' | 'editor';
}

interface AdminAuthStore {
    admin: AdminUser | null;
    isAuthenticated: boolean;
    login: (username: string, password: string) => Promise<boolean>; // Mock login
    logout: () => void;
}

export const useAdminAuth = create<AdminAuthStore>()(
    persist(
        (set) => ({
            admin: null,
            isAuthenticated: false,
            login: async (username, password) => {
                // Mock Admin Login - in production this would hit an API
                // Hardcoded specifically for demo purposes
                if ((username === 'admin' && password === 'admin123') ||
                    (username === 'owner' && password === 'securepass')) {
                    set({
                        isAuthenticated: true,
                        admin: {
                            id: 'admin-1',
                            username: username,
                            role: 'superadmin'
                        }
                    });
                    return true;
                }
                return false;
            },
            logout: () => {
                set({ admin: null, isAuthenticated: false });
            },
        }),
        {
            name: 'allure-admin-auth-strict', // Unique storage key
        }
    )
);
