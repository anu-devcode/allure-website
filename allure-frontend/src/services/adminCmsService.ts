import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export type CmsSetting = {
    id?: string;
    key: string;
    value: string;
};

export const adminCmsService = {
    async getSettings(): Promise<CmsSetting[]> {
        const response = await axios.get<CmsSetting[]>(`${API_BASE_URL}/cms`);
        return response.data;
    },

    async updateSettings(token: string, settings: CmsSetting[]): Promise<void> {
        await axios.post(
            `${API_BASE_URL}/cms`,
            { settings: settings.map((item) => ({ key: item.key, value: item.value })) },
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
    },
};
