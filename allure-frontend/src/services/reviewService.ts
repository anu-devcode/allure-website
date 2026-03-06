import axios from "axios";
import { Review } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type EligibilityResponse = {
    canReview: boolean;
    hasReviewed: boolean;
    availableOrders: Array<{
        id: string;
        orderNumber: string;
        createdAt: string;
    }>;
    latestReview: Review | null;
};

type ProductReviewsResponse = {
    reviews: Review[];
    summary: {
        averageRating: number | null;
        reviewCount: number;
    };
};

export const reviewService = {
    async getProductReviews(productId: string): Promise<ProductReviewsResponse> {
        const response = await axios.get<ProductReviewsResponse>(`${API_BASE_URL}/reviews/product/${productId}`);
        return response.data;
    },

    async getReviewEligibility(productId: string, token: string): Promise<EligibilityResponse> {
        const response = await axios.get<EligibilityResponse>(`${API_BASE_URL}/reviews/customer/product/${productId}/eligibility`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    },

    async submitReview(token: string, payload: { productId: string; orderId: string; rating: number; comment: string }): Promise<{ message: string; review: Review }> {
        const response = await axios.post<{ message: string; review: Review }>(`${API_BASE_URL}/reviews/customer`, payload, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    },
};