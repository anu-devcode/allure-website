import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface AdminReview {
    id: string;
    customerName: string;
    customerEmail?: string;
    productName?: string;
    rating: number;
    comment: string;
    isApproved: boolean;
    createdAt: string;
}

export const adminReviewService = {
    async getReviews(token: string): Promise<AdminReview[]> {
        const response = await axios.get<AdminReview[]>(`${API_BASE_URL}/reviews/admin`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    },

    async updateReview(
        token: string,
        id: string,
        payload: Partial<Pick<AdminReview, "customerName" | "customerEmail" | "productName" | "rating" | "comment" | "isApproved">>
    ): Promise<AdminReview> {
        const response = await axios.put<AdminReview>(`${API_BASE_URL}/reviews/admin/${id}`, payload, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    },

    async deleteReview(token: string, id: string): Promise<void> {
        await axios.delete(`${API_BASE_URL}/reviews/admin/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
    },
};
