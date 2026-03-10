"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { cmsService } from "@/services/cmsService";
import { CmsContent, DEFAULT_CMS_CONTENT, mapSettingsToCmsContent } from "@/lib/cms";

type StorefrontCmsContextValue = {
    content: CmsContent;
    loading: boolean;
};

const StorefrontCmsContext = createContext<StorefrontCmsContextValue>({
    content: DEFAULT_CMS_CONTENT,
    loading: true,
});

export function StorefrontCmsProvider({ children }: { children: React.ReactNode }) {
    const [content, setContent] = useState<CmsContent>(DEFAULT_CMS_CONTENT);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const settings = await cmsService.getSettings();
                setContent(mapSettingsToCmsContent(settings));
            } catch {
                setContent(DEFAULT_CMS_CONTENT);
            } finally {
                setLoading(false);
            }
        };

        void load();
    }, []);

    const value = useMemo(() => ({ content, loading }), [content, loading]);

    return <StorefrontCmsContext.Provider value={value}>{children}</StorefrontCmsContext.Provider>;
}

export const useStorefrontCms = () => useContext(StorefrontCmsContext);