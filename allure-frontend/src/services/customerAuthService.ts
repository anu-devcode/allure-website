import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface CustomerAuthUser {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    city: string | null;
    joinedAt: string;
}

interface AuthResponse {
    token: string;
    refreshToken: string;
    user: CustomerAuthUser;
}

export const customerAuthService = {
    async register(payload: { name: string; email: string; phone: string; password: string }): Promise<AuthResponse> {
        const response = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/customer/register`, payload);
        return response.data;
    },

    async login(payload: { email: string; password: string }): Promise<AuthResponse> {
        const response = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/customer/login`, payload);
        return response.data;
    },

    async getMe(token: string): Promise<{ user: CustomerAuthUser }> {
        const response = await axios.get<{ user: CustomerAuthUser }>(`${API_BASE_URL}/auth/customer/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        return response.data;
    },

    async updateProfile(token: string, payload: { name?: string; phone?: string; city?: string }): Promise<{ user: CustomerAuthUser }> {
        const response = await axios.patch<{ user: CustomerAuthUser }>(`${API_BASE_URL}/auth/customer/profile`, payload, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        return response.data;
    },

    async refresh(refreshToken: string): Promise<AuthResponse> {
        const response = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/customer/refresh`, {
            refreshToken,
        });
        return response.data;
    },

    async logout(refreshToken: string): Promise<void> {
        await axios.post(`${API_BASE_URL}/auth/logout`, { refreshToken });
    },

    async forgotPassword(email: string): Promise<{ message: string; resetToken?: string }> {
        const response = await axios.post<{ message: string; resetToken?: string }>(`${API_BASE_URL}/auth/password/forgot`, {
            email,
        });
        return response.data;
    },

    async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
        const response = await axios.post<{ message: string }>(`${API_BASE_URL}/auth/password/reset`, {
            token,
            newPassword,
        });
        return response.data;
    },
};