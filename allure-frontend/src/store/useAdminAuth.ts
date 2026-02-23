import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { adminAuthService } from '@/services/adminAuthService';

interface AdminUser {
    id: string;
    email: string;
    name?: string;
    role: 'ADMIN' | 'STAFF';
}

interface AdminAuthStore {
    admin: AdminUser | null;
    token: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    rehydrateSession: () => Promise<void>;
    updatePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

export const useAdminAuth = create<AdminAuthStore>()(
    persist(
        (set, get) => ({
            admin: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            login: async (email, password) => {
                try {
                    const result = await adminAuthService.login({ email, password });
                    set({
                        isAuthenticated: true,
                        admin: {
                            id: result.user.id,
                            email: result.user.email,
                            name: result.user.name ?? undefined,
                            role: result.user.role,
                        },
                        token: result.token,
                        refreshToken: result.refreshToken,
                    });
                    return true;
                } catch {
                    set({ admin: null, token: null, refreshToken: null, isAuthenticated: false });
                    return false;
                }
            },
            logout: () => {
                const refreshToken = get().refreshToken;
                if (refreshToken) {
                    void adminAuthService.logout(refreshToken);
                }
                set({ admin: null, token: null, refreshToken: null, isAuthenticated: false });
            },

            rehydrateSession: async () => {
                const token = get().token;
                const refreshToken = get().refreshToken;
                if (!token) {
                    set({ admin: null, isAuthenticated: false });
                    return;
                }

                try {
                    const result = await adminAuthService.getMe(token);
                    set({
                        admin: {
                            id: result.user.id,
                            email: result.user.email,
                            name: result.user.name ?? undefined,
                            role: result.user.role,
                        },
                        isAuthenticated: true,
                    });
                } catch {
                    if (!refreshToken) {
                        set({ admin: null, token: null, refreshToken: null, isAuthenticated: false });
                        return;
                    }

                    try {
                        const refreshed = await adminAuthService.refresh(refreshToken);
                        set({
                            admin: {
                                id: refreshed.user.id,
                                email: refreshed.user.email,
                                name: refreshed.user.name ?? undefined,
                                role: refreshed.user.role,
                            },
                            token: refreshed.token,
                            refreshToken: refreshed.refreshToken,
                            isAuthenticated: true,
                        });
                    } catch {
                        set({ admin: null, token: null, refreshToken: null, isAuthenticated: false });
                    }
                }
            },

            updatePassword: async (currentPassword, newPassword) => {
                const token = get().token;
                const refreshToken = get().refreshToken;

                if (!token) {
                    return false;
                }

                try {
                    await adminAuthService.updatePassword(token, { currentPassword, newPassword });
                    if (refreshToken) {
                        void adminAuthService.logout(refreshToken);
                    }
                    set({ admin: null, token: null, refreshToken: null, isAuthenticated: false });
                    return true;
                } catch {
                    return false;
                }
            },
        }),
        {
            name: 'allure-admin-auth-strict',
        }
    )
);
