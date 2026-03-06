import axios from "axios";
import { Review } from "@/types";
import { adminAuthService } from "@/services/adminAuthService";
import { useAdminAuth } from "@/store/useAdminAuth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
export const ADMIN_REVIEW_AUTH_EXPIRED_ERROR = "ADMIN_REVIEW_AUTH_EXPIRED";

export interface AdminReview extends Review {}

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
        throw new Error(ADMIN_REVIEW_AUTH_EXPIRED_ERROR);
    }

    try {
        return await requestFactory(initialToken);
    } catch (error) {
        if (!axios.isAxiosError(error) || error.response?.status !== 401) {
            throw error;
        }

        const refreshedToken = await tryRefreshAdminToken();
        if (!refreshedToken) {
            throw new Error(ADMIN_REVIEW_AUTH_EXPIRED_ERROR);
        }

        try {
            return await requestFactory(refreshedToken);
        } catch (retryError) {
            if (axios.isAxiosError(retryError) && retryError.response?.status === 401) {
                useAdminAuth.setState({ admin: null, token: null, refreshToken: null, isAuthenticated: false });
                throw new Error(ADMIN_REVIEW_AUTH_EXPIRED_ERROR);
            }

            throw retryError;
        }
    }
};

export const adminReviewService = {
    async getReviews(token: string): Promise<AdminReview[]> {
        const response = await executeWithAdminAuthRetry(
            (activeToken) => axios.get<AdminReview[]>(`${API_BASE_URL}/reviews/admin`, {
                headers: { Authorization: `Bearer ${activeToken}` },
            }),
            token
        );
        return response.data;
    },

    async updateReview(
        token: string,
        id: string,
        payload: Partial<Pick<AdminReview, "customerName" | "customerEmail" | "productName" | "rating" | "comment" | "isApproved">>
    ): Promise<AdminReview> {
        const response = await executeWithAdminAuthRetry(
            (activeToken) => axios.put<AdminReview>(`${API_BASE_URL}/reviews/admin/${id}`, payload, {
                headers: { Authorization: `Bearer ${activeToken}` },
            }),
            token
        );
        return response.data;
    },

    async deleteReview(token: string, id: string): Promise<void> {
        await executeWithAdminAuthRetry(
            (activeToken) => axios.delete(`${API_BASE_URL}/reviews/admin/${id}`, {
                headers: { Authorization: `Bearer ${activeToken}` },
            }),
            token
        );
    },
};
