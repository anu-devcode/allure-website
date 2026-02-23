"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Save, Image as ImageIcon, Link as LinkIcon, Plus, Eye } from "lucide-react";
import { adminCmsService } from "@/services/adminCmsService";
import { useAdminAuth } from "@/store/useAdminAuth";

export default function CMSPage() {
    const token = useAdminAuth((s) => s.token);
    const [loading, setLoading] = useState(false);
    const [loadingSettings, setLoadingSettings] = useState(true);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        heroTitle: "Discover Your Perfect Allure",
        heroSubtitle: "Premium turkish and shein products delivered to your door in Addis Ababa.",
        heroImageUrl: "",
        socialTelegram: "@allureshop",
        socialInstagram: "@allure.et",
        socialWhatsapp: "+251 9XX XXX XXX",
        announcementText: "",
        announcementEnabled: false,
    });

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const settings = await adminCmsService.getSettings();
                const settingMap = new Map(settings.map((item) => [item.key, item.value]));

                setFormData((current) => ({
                    ...current,
                    heroTitle: settingMap.get("hero_title") ?? current.heroTitle,
                    heroSubtitle: settingMap.get("hero_subtitle") ?? current.heroSubtitle,
                    heroImageUrl: settingMap.get("hero_image_url") ?? current.heroImageUrl,
                    socialTelegram: settingMap.get("social_telegram") ?? current.socialTelegram,
                    socialInstagram: settingMap.get("social_instagram") ?? current.socialInstagram,
                    socialWhatsapp: settingMap.get("social_whatsapp") ?? current.socialWhatsapp,
                    announcementText: settingMap.get("announcement_text") ?? current.announcementText,
                    announcementEnabled: (settingMap.get("announcement_enabled") ?? "false") === "true",
                }));
            } finally {
                setLoadingSettings(false);
            }
        };

        void loadSettings();
    }, []);

    const settingsPayload = useMemo(
        () => [
            { key: "hero_title", value: formData.heroTitle },
            { key: "hero_subtitle", value: formData.heroSubtitle },
            { key: "hero_image_url", value: formData.heroImageUrl },
            { key: "social_telegram", value: formData.socialTelegram },
            { key: "social_instagram", value: formData.socialInstagram },
            { key: "social_whatsapp", value: formData.socialWhatsapp },
            { key: "announcement_text", value: formData.announcementText },
            { key: "announcement_enabled", value: String(formData.announcementEnabled) },
        ],
        [formData]
    );

    const handleSave = async () => {
        if (!token) {
            return;
        }

        setLoading(true);
        setSaveMessage(null);

        try {
            await adminCmsService.updateSettings(token, settingsPayload);
            setSaveMessage("Changes saved successfully.");
        } catch {
            setSaveMessage("Failed to save changes.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-display text-3xl font-bold text-dark">Content Management</h1>
                    <p className="text-dark/60">Update homepage hero, banners, and social links.</p>
                </div>
                <Button variant="primary" className="rounded-2xl px-8 shadow-lg shadow-accent/20" onClick={handleSave} disabled={loading}>
                    {loading ? "Saving..." : <><Save className="h-4 w-4 mr-2" /> Save Changes</>}
                </Button>
            </div>

            {loadingSettings ? (
                <div className="text-sm text-dark/40">Loading content settings...</div>
            ) : null}

            {saveMessage ? (
                <div className="rounded-2xl border border-secondary/10 bg-white px-4 py-3 text-sm text-dark/60">
                    {saveMessage}
                </div>
            ) : null}

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Homepage Hero Section */}
                <div className="rounded-3xl bg-white p-8 shadow-sm border border-secondary/10 flex flex-col gap-6">
                    <h3 className="font-bold text-xl text-dark flex items-center gap-2">
                        <ImageIcon className="h-5 w-5 text-accent" /> Hero Section
                    </h3>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-dark/80">Main Headline</label>
                            <input
                                type="text"
                                value={formData.heroTitle}
                                onChange={(event) => setFormData((current) => ({ ...current, heroTitle: event.target.value }))}
                                className="h-12 rounded-xl border border-secondary/20 px-4 text-sm focus:border-accent outline-none"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-dark/80">Sub-headline</label>
                            <textarea
                                rows={2}
                                value={formData.heroSubtitle}
                                onChange={(event) => setFormData((current) => ({ ...current, heroSubtitle: event.target.value }))}
                                className="rounded-xl border border-secondary/20 p-4 text-sm focus:border-accent outline-none resize-none"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-dark/80">Banner Image URL</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={formData.heroImageUrl}
                                    onChange={(event) => setFormData((current) => ({ ...current, heroImageUrl: event.target.value }))}
                                    placeholder="/images/hero-bg.jpg"
                                    className="flex-1 h-12 rounded-xl border border-secondary/20 px-4 text-sm focus:border-accent outline-none"
                                />
                                <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl"><Plus /></Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Promotion Banners */}
                <div className="rounded-3xl bg-white p-8 shadow-sm border border-secondary/10 flex flex-col gap-6">
                    <h3 className="font-bold text-xl text-dark flex items-center gap-2">
                        <Plus className="h-5 w-5 text-accent" /> Promotion Banners
                    </h3>
                    <div className="flex flex-col gap-4">
                        <div className="p-4 rounded-2xl bg-secondary/5 border border-secondary/10 flex items-center justify-between">
                            <div>
                                <p className="font-bold text-sm text-dark">Free Delivery Banner</p>
                                <p className="text-xs text-dark/40">Active • "FREE DELIVERY IN ADDIS ABABA"</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"><Eye className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-red-500">×</Button>
                            </div>
                        </div>
                        <Button variant="outline" className="w-full rounded-xl border-dashed border-2 py-6 text-dark/40 hover:text-accent hover:border-accent transition-all">
                            + Add New Banner
                        </Button>
                    </div>
                </div>

                {/* Social Media Links */}
                <div className="rounded-3xl bg-white p-8 shadow-sm border border-secondary/10 flex flex-col gap-6">
                    <h3 className="font-bold text-xl text-dark flex items-center gap-2">
                        <LinkIcon className="h-5 w-5 text-accent" /> Social Media
                    </h3>
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-dark/80">Telegram</label>
                                <input
                                    type="text"
                                    value={formData.socialTelegram}
                                    onChange={(event) => setFormData((current) => ({ ...current, socialTelegram: event.target.value }))}
                                    className="h-12 rounded-xl border border-secondary/20 px-4 text-sm focus:border-accent outline-none"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-dark/80">Instagram</label>
                                <input
                                    type="text"
                                    value={formData.socialInstagram}
                                    onChange={(event) => setFormData((current) => ({ ...current, socialInstagram: event.target.value }))}
                                    className="h-12 rounded-xl border border-secondary/20 px-4 text-sm focus:border-accent outline-none"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-dark/80">WhatsApp Business</label>
                            <input
                                type="text"
                                value={formData.socialWhatsapp}
                                onChange={(event) => setFormData((current) => ({ ...current, socialWhatsapp: event.target.value }))}
                                className="h-12 rounded-xl border border-secondary/20 px-4 text-sm focus:border-accent outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Global Announcement */}
                <div className="rounded-3xl bg-primary/20 p-8 border border-primary/30 flex flex-col gap-4">
                    <h3 className="font-bold text-sm text-dark uppercase tracking-widest">Global Announcement</h3>
                    <textarea
                        rows={3}
                        value={formData.announcementText}
                        onChange={(event) => setFormData((current) => ({ ...current, announcementText: event.target.value }))}
                        placeholder="Type an announcement to show at the top of every page..."
                        className="rounded-2xl border-none bg-white/50 p-4 text-sm focus:bg-white focus:ring-1 focus:ring-accent outline-none resize-none"
                    />
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            className="h-4 w-4 accent-accent"
                            id="announce-active"
                            checked={formData.announcementEnabled}
                            onChange={(event) => setFormData((current) => ({ ...current, announcementEnabled: event.target.checked }))}
                        />
                        <label htmlFor="announce-active" className="text-xs font-bold text-dark/60 cursor-pointer">Enable announcement bar</label>
                    </div>
                </div>
            </div>
        </div>
    );
}
