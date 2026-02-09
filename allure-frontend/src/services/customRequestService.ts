import axios from "axios";

const API_BAR_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface CustomRequestData {
    customerName: string;
    customerPhone: string;
    itemLink?: string;
    description: string;
    imageUrls?: string[];
}

export const submitCustomRequest = async (data: CustomRequestData) => {
    try {
        const response = await axios.post(`${API_BAR_URL}/custom-requests`, data);
        return response.data;
    } catch (error) {
        console.error("Error submitting custom request:", error);
        throw error;
    }
};

export const getCustomRequests = async (token: string) => {
    try {
        const response = await axios.get(`${API_BAR_URL}/custom-requests`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching custom requests:", error);
        throw error;
    }
};

export const updateCustomRequestStatus = async (id: string, status: string, adminNotes: string, token: string) => {
    try {
        const response = await axios.patch(`${API_BAR_URL}/custom-requests/${id}/status`,
            { status, adminNotes },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    } catch (error) {
        console.error("Error updating custom request status:", error);
        throw error;
    }
};
