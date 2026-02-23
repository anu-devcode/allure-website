import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface AdminCustomer {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    city: string | null;
    createdAt: string;
    _count?: {
        orders: number;
    };
}

export const adminCustomerService = {
    async getCustomers(token: string): Promise<AdminCustomer[]> {
        const response = await axios.get<AdminCustomer[]>(`${API_BASE_URL}/customers`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    },

    async createCustomer(
        token: string,
        payload: { name: string; email: string; phone: string; city?: string; password: string }
    ): Promise<AdminCustomer> {
        const response = await axios.post<AdminCustomer>(`${API_BASE_URL}/customers`, payload, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    },

    async updateCustomer(
        token: string,
        id: string,
        payload: { name?: string; email?: string; phone?: string; city?: string; password?: string }
    ): Promise<AdminCustomer> {
        const response = await axios.put<AdminCustomer>(`${API_BASE_URL}/customers/${id}`, payload, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    },

    async deleteCustomer(token: string, id: string): Promise<void> {
        await axios.delete(`${API_BASE_URL}/customers/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
    },
};
