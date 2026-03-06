import axios from "axios";
import { adminAuthService } from "@/services/adminAuthService";
import { useAdminAuth } from "@/store/useAdminAuth";

const API_BAR_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
export const ADMIN_AUTH_EXPIRED_ERROR = "ADMIN_AUTH_EXPIRED";

export interface CustomRequest {
    id: string;
    customerName: string;
    customerPhone: string;
    itemLink?: string;
    description: string;
    imageUrls: string[];
    status: "PENDING" | "QUOTED" | "CONVERTED" | "REJECTED";
    adminNotes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CustomRequestData {
    customerName: string;
    customerPhone: string;
    itemLink?: string;
    description: string;
    imageUrls?: string[];
}

const getActiveAdminToken = (fallbackToken?: string | null) => fallbackToken ?? useAdminAuth.getState().token;

const tryRefreshAdminToken = async (): Promise<string | null> => {
    const { refreshToken, admin } = useAdminAuth.getState();

    if (!refreshToken) {
        return null;
    }

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
        useAdminAuth.setState({
            admin: admin ?? null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
        });
        return null;
    }
};

const executeWithAdminAuthRetry = async <T>(
    requestFactory: (token: string) => Promise<T>,
    providedToken?: string
): Promise<T> => {
    const initialToken = getActiveAdminToken(providedToken);

    if (!initialToken) {
        throw new Error(ADMIN_AUTH_EXPIRED_ERROR);
    }

    try {
        return await requestFactory(initialToken);
    } catch (error) {
        if (!axios.isAxiosError(error) || error.response?.status !== 401) {
            throw error;
        }

        const refreshedToken = await tryRefreshAdminToken();
        if (!refreshedToken) {
            throw new Error(ADMIN_AUTH_EXPIRED_ERROR);
        }

        try {
            return await requestFactory(refreshedToken);
        } catch (retryError) {
            if (axios.isAxiosError(retryError) && retryError.response?.status === 401) {
                useAdminAuth.setState({ admin: null, token: null, refreshToken: null, isAuthenticated: false });
                throw new Error(ADMIN_AUTH_EXPIRED_ERROR);
            }

            throw retryError;
        }
    }
};

export const submitCustomRequest = async (data: CustomRequestData) => {
    try {
        const response = await axios.post(`${API_BAR_URL}/custom-requests`, data);
        return response.data;
    } catch (error) {
        console.error("Error submitting custom request:", error);
        throw error;
    }
};

export const getCustomRequests = async (token: string): Promise<CustomRequest[]> => {
    try {
        const response = await executeWithAdminAuthRetry(
            (activeToken) => axios.get<CustomRequest[]>(`${API_BAR_URL}/custom-requests`, {
                headers: { Authorization: `Bearer ${activeToken}` }
            }),
            token
        );
        return response.data;
    } catch (error) {
        if (error instanceof Error && error.message === ADMIN_AUTH_EXPIRED_ERROR) {
            throw error;
        }

        console.error("Error fetching custom requests:", error);
        throw error;
    }
};

export const updateCustomRequestStatus = async (
    id: string,
    status: CustomRequest["status"],
    adminNotes: string,
    token: string
): Promise<CustomRequest> => {
    try {
        const response = await executeWithAdminAuthRetry(
            (activeToken) => axios.patch(`${API_BAR_URL}/custom-requests/${id}/status`,
                { status, adminNotes },
                { headers: { Authorization: `Bearer ${activeToken}` } }
            ),
            token
        );
        return response.data;
    } catch (error) {
        if (error instanceof Error && error.message === ADMIN_AUTH_EXPIRED_ERROR) {
            throw error;
        }

        console.error("Error updating custom request status:", error);
        throw error;
    }
};
