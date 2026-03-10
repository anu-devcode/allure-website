import axios from "axios";
import { CmsSettingEntry } from "@/lib/cms";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const cmsService = {
    async getSettings(): Promise<CmsSettingEntry[]> {
        const response = await axios.get<CmsSettingEntry[]>(`${API_BASE_URL}/cms`);
        return response.data;
    },
};