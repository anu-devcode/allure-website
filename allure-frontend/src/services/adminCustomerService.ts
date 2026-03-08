import axios from "axios";
import { adminAuthService } from "@/services/adminAuthService";
import { useAdminAuth } from "@/store/useAdminAuth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
export const ADMIN_CUSTOMER_AUTH_EXPIRED_ERROR = "ADMIN_CUSTOMER_AUTH_EXPIRED";

export interface AdminCustomer {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    city: string | null;
    createdAt: string;
    updatedAt?: string;
    orderCount: number;
    deliveredOrderCount: number;
    pendingOrderCount: number;
    totalSpent: number;
    lastOrderAt?: string | null;
    lastOrderNumber?: string | null;
    _count?: {
        orders: number;
    };
}

const getActiveAdminToken = (fallbackToken?: string | null) => fallbackToken ?? useAdminAuth.getState().token;

const tryRefreshAdminToken = async (): Promise<string | null> => {
    const { refreshToken } = useAdminAuth.getState();
    if (!refreshToken) return null;

    try {
        const refreshed = await adminAuthService.refresh(refreshToken);
        useAdminAuth.setState({
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
        return refreshed.token;
    } catch {
        useAdminAuth.setState({ admin: null, token: null, refreshToken: null, isAuthenticated: false });
        return null;
    }
};

const executeWithAdminAuthRetry = async <T>(requestFactory: (token: string) => Promise<T>, providedToken?: string): Promise<T> => {
    const initialToken = getActiveAdminToken(providedToken);
    if (!initialToken) {
        throw new Error(ADMIN_CUSTOMER_AUTH_EXPIRED_ERROR);
    }

    try {
        return await requestFactory(initialToken);
    } catch (error) {
        if (!axios.isAxiosError(error) || error.response?.status !== 401) {
            throw error;
        }

        const refreshedToken = await tryRefreshAdminToken();
        if (!refreshedToken) {
            throw new Error(ADMIN_CUSTOMER_AUTH_EXPIRED_ERROR);
        }

        try {
            return await requestFactory(refreshedToken);
        } catch (retryError) {
            if (axios.isAxiosError(retryError) && retryError.response?.status === 401) {
                useAdminAuth.setState({ admin: null, token: null, refreshToken: null, isAuthenticated: false });
                throw new Error(ADMIN_CUSTOMER_AUTH_EXPIRED_ERROR);
            }

            throw retryError;
        }
    }
};

export const adminCustomerService = {
    async getCustomers(token: string): Promise<AdminCustomer[]> {
        const response = await executeWithAdminAuthRetry(
            (activeToken) => axios.get<AdminCustomer[]>(`${API_BASE_URL}/customers`, {
                headers: { Authorization: `Bearer ${activeToken}` },
            }),
            token
        );
        return response.data;
    },

    async createCustomer(
        token: string,
        payload: { name: string; email: string; phone: string; city?: string; password: string }
    ): Promise<AdminCustomer> {
        const response = await executeWithAdminAuthRetry(
            (activeToken) => axios.post<AdminCustomer>(`${API_BASE_URL}/customers`, payload, {
                headers: { Authorization: `Bearer ${activeToken}` },
            }),
            token
        );
        return response.data;
    },

    async updateCustomer(
        token: string,
        id: string,
        payload: { name?: string; email?: string; phone?: string; city?: string; password?: string }
    ): Promise<AdminCustomer> {
        const response = await executeWithAdminAuthRetry(
            (activeToken) => axios.put<AdminCustomer>(`${API_BASE_URL}/customers/${id}`, payload, {
                headers: { Authorization: `Bearer ${activeToken}` },
            }),
            token
        );
        return response.data;
    },

    async deleteCustomer(token: string, id: string): Promise<void> {
        await executeWithAdminAuthRetry(
            (activeToken) => axios.delete(`${API_BASE_URL}/customers/${id}`, {
                headers: { Authorization: `Bearer ${activeToken}` },
            }),
            token
        );
    },
};
