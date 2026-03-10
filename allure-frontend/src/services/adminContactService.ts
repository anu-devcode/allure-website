import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface ContactMessage {
    id: string;
    name: string;
    contact: string;
    message: string;
    status: "NEW" | "IN_PROGRESS" | "FOLLOW_UP" | "RESOLVED";
    senderType: "GUEST" | "REGISTERED";
    customer: {
        id: string;
        name: string | null;
        email: string;
        phone: string | null;
    } | null;
    followUpAt: string | null;
    followUpNote: string | null;
    lastReplyAt: string | null;
    lastReplyChannel: "PHONE" | "WHATSAPP" | "TELEGRAM" | "EMAIL" | "OTHER" | null;
    lastReplySummary: string | null;
    createdAt: string;
}

export interface UpdateContactMessagePayload {
    status?: "NEW" | "IN_PROGRESS" | "FOLLOW_UP" | "RESOLVED";
    followUpAt?: string | null;
    followUpNote?: string | null;
    lastReplyAt?: string | null;
    lastReplyChannel?: "PHONE" | "WHATSAPP" | "TELEGRAM" | "EMAIL" | "OTHER" | null;
    lastReplySummary?: string | null;
}

export const adminContactService = {
    async getMessages(token: string): Promise<ContactMessage[]> {
        const response = await axios.get<ContactMessage[]>(`${API_BASE_URL}/contact-messages`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    },

    async updateMessage(token: string, id: string, payload: UpdateContactMessagePayload): Promise<ContactMessage> {
        const response = await axios.patch<ContactMessage>(
            `${API_BASE_URL}/contact-messages/${id}`,
            payload,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    },

    async updateMessageStatus(token: string, id: string, status: "NEW" | "IN_PROGRESS" | "FOLLOW_UP" | "RESOLVED"): Promise<ContactMessage> {
        return this.updateMessage(token, id, { status });
    },

    async deleteMessage(token: string, id: string): Promise<void> {
        await axios.delete(`${API_BASE_URL}/contact-messages/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
    },

    async submitMessage(payload: { name: string; contact: string; message: string }, token?: string | null): Promise<void> {
        await axios.post(`${API_BASE_URL}/contact-messages`, payload, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
    },
};
