import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface AdminAuthUser {
    id: string;
    email: string;
    name: string | null;
    role: "ADMIN" | "STAFF";
}

interface AdminAuthResponse {
    token: string;
    refreshToken: string;
    user: AdminAuthUser;
}

export const adminAuthService = {
    async login(payload: { email: string; password: string }): Promise<AdminAuthResponse> {
        const response = await axios.post<AdminAuthResponse>(`${API_BASE_URL}/auth/admin/login`, payload);
        return response.data;
    },

    async getMe(token: string): Promise<{ user: AdminAuthUser }> {
        const response = await axios.get<{ user: AdminAuthUser }>(`${API_BASE_URL}/auth/admin/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    },

    async refresh(refreshToken: string): Promise<AdminAuthResponse> {
        const response = await axios.post<AdminAuthResponse>(`${API_BASE_URL}/auth/admin/refresh`, {
            refreshToken,
        });
        return response.data;
    },

    async logout(refreshToken: string): Promise<void> {
        await axios.post(`${API_BASE_URL}/auth/logout`, { refreshToken });
    },

    async updatePassword(token: string, payload: { currentPassword: string; newPassword: string }): Promise<void> {
        await axios.patch(`${API_BASE_URL}/auth/admin/password`, payload, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    },
};
