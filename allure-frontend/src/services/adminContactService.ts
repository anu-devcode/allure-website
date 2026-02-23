import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface ContactMessage {
    id: string;
    name: string;
    contact: string;
    message: string;
    status: "NEW" | "RESOLVED";
    createdAt: string;
}

export const adminContactService = {
    async getMessages(token: string): Promise<ContactMessage[]> {
        const response = await axios.get<ContactMessage[]>(`${API_BASE_URL}/contact-messages`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    },

    async updateMessageStatus(token: string, id: string, status: "NEW" | "RESOLVED"): Promise<ContactMessage> {
        const response = await axios.patch<ContactMessage>(
            `${API_BASE_URL}/contact-messages/${id}`,
            { status },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    },

    async deleteMessage(token: string, id: string): Promise<void> {
        await axios.delete(`${API_BASE_URL}/contact-messages/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
    },

    async submitMessage(payload: { name: string; contact: string; message: string }): Promise<void> {
        await axios.post(`${API_BASE_URL}/contact-messages`, payload);
    },
};
