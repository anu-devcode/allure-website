"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/store/useAdminAuth";
import { useRouter } from "next/navigation";
import { Bell, Lock, RefreshCw, Settings, Shield, User, Globe, Sliders, Save } from "lucide-react";
import { adminCmsService } from "@/services/adminCmsService";

const profileStorageKey = "allure-admin-profile";
const preferencesStorageKey = "allure-admin-preferences";

type SettingsTab = "profile" | "preferences" | "security" | "global" | "advanced" | "system";

export default function AdminSettingsPage() {
    const router = useRouter();
    const admin = useAdminAuth((state) => state.admin);
    const updatePassword = useAdminAuth((state) => state.updatePassword);
    const logout = useAdminAuth((state) => state.logout);
    const rehydrateSession = useAdminAuth((state) => state.rehydrateSession);

    const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [securityLoading, setSecurityLoading] = useState(false);
    const [securityError, setSecurityError] = useState("");
    const [securitySuccess, setSecuritySuccess] = useState("");

    const [displayName, setDisplayName] = useState("");
    const [profileMessage, setProfileMessage] = useState<string | null>(null);

    const [preferences, setPreferences] = useState({
        notifyOrders: true,
        notifyPayments: true,
        notifyRequests: true,
        notifyReviews: false,
        weeklyDigest: true,
    });
    const [preferencesMessage, setPreferencesMessage] = useState<string | null>(null);

    const [systemMessage, setSystemMessage] = useState<string | null>(null);
    const [globalMessage, setGlobalMessage] = useState<string | null>(null);
    const [advancedMessage, setAdvancedMessage] = useState<string | null>(null);
    const [settingsLoading, setSettingsLoading] = useState(false);

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

    const [globalConfig, setGlobalConfig] = useState({
        storeName: "Allure",
        supportEmail: "support@allure.et",
        supportPhone: "+251 9XX XXX XXX",
        orderPrefix: "ALR",
        currency: "ETB",
        timezone: "Africa/Addis_Ababa",
        maintenanceMode: false,
    });

    const [advancedConfig, setAdvancedConfig] = useState({
        enableGuestCheckout: true,
        minOrderValue: 0,
        taxRate: 0,
        inventoryTracking: true,
        lowStockThreshold: 5,
        enableReviews: true,
        allowPreorder: true,
        analyticsEnabled: true,
    });

    useEffect(() => {
        const storedName = (() => {
            try {
                return localStorage.getItem(profileStorageKey) ?? "";
            } catch {
                return "";
            }
        })();

        setDisplayName(storedName || admin?.name || "");
    }, [admin?.name]);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(preferencesStorageKey);
            if (stored) {
                const parsed = JSON.parse(stored) as typeof preferences;
                setPreferences(parsed);
            }
        } catch {
            return;
        }
    }, []);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const settings = await adminCmsService.getSettings();
                const settingMap = new Map(settings.map((item) => [item.key, item.value]));

                setGlobalConfig((current) => ({
                    ...current,
                    storeName: settingMap.get("store_name") ?? current.storeName,
                    supportEmail: settingMap.get("support_email") ?? current.supportEmail,
                    supportPhone: settingMap.get("support_phone") ?? current.supportPhone,
                    orderPrefix: settingMap.get("order_prefix") ?? current.orderPrefix,
                    currency: settingMap.get("currency") ?? current.currency,
                    timezone: settingMap.get("timezone") ?? current.timezone,
                    maintenanceMode: (settingMap.get("maintenance_mode") ?? "false") === "true",
                }));

                setAdvancedConfig((current) => ({
                    ...current,
                    enableGuestCheckout: (settingMap.get("enable_guest_checkout") ?? "true") === "true",
                    minOrderValue: Number(settingMap.get("min_order_value") ?? current.minOrderValue),
                    taxRate: Number(settingMap.get("tax_rate") ?? current.taxRate),
                    inventoryTracking: (settingMap.get("inventory_tracking") ?? "true") === "true",
                    lowStockThreshold: Number(settingMap.get("low_stock_threshold") ?? current.lowStockThreshold),
                    enableReviews: (settingMap.get("enable_reviews") ?? "true") === "true",
                    allowPreorder: (settingMap.get("allow_preorder") ?? "true") === "true",
                    analyticsEnabled: (settingMap.get("analytics_enabled") ?? "true") === "true",
                }));
            } catch {
                return;
            }
        };

        void loadSettings();
    }, []);

    const adminInitials = useMemo(() => {
        if (!admin?.email) {
            return "AD";
        }
        const value = admin.name || admin.email;
        return value
            .split(" ")
            .slice(0, 2)
            .map((piece) => piece[0]?.toUpperCase())
            .join("") || "AD";
    }, [admin?.email, admin?.name]);

    const handlePasswordSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setSecurityError("");
        setSecuritySuccess("");

        if (newPassword.length < 8) {
            setSecurityError("New password must be at least 8 characters.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setSecurityError("Password confirmation does not match.");
            return;
        }

        setSecurityLoading(true);
        const ok = await updatePassword(currentPassword, newPassword);
        setSecurityLoading(false);

        if (!ok) {
            setSecurityError("Failed to update password. Check your current password and try again.");
            return;
        }

        setSecuritySuccess("Password updated. Please log in again.");
        setTimeout(() => {
            router.push("/admin/login");
        }, 900);
    };

    const handleSaveProfile = () => {
        try {
            localStorage.setItem(profileStorageKey, displayName.trim());
            setProfileMessage("Profile saved for this browser.");
        } catch {
            setProfileMessage("Unable to save profile locally.");
        }
    };

    const handleSavePreferences = () => {
        try {
            localStorage.setItem(preferencesStorageKey, JSON.stringify(preferences));
            setPreferencesMessage("Preferences saved.");
        } catch {
            setPreferencesMessage("Unable to save preferences.");
        }
    };

    const handleClearLocal = () => {
        try {
            localStorage.removeItem(profileStorageKey);
            localStorage.removeItem(preferencesStorageKey);
            setDisplayName(admin?.name || "");
            setPreferences({
                notifyOrders: true,
                notifyPayments: true,
                notifyRequests: true,
                notifyReviews: false,
                weeklyDigest: true,
            });
            setSystemMessage("Local settings cleared.");
        } catch {
            setSystemMessage("Unable to clear local settings.");
        }
    };

    const handleRefreshSession = async () => {
        setSystemMessage(null);
        try {
            await rehydrateSession();
            setSystemMessage("Session refreshed.");
        } catch {
            setSystemMessage("Unable to refresh session.");
        }
    };

    const handleLogout = () => {
        logout();
        router.push("/admin/login");
    };

    const handleSaveGlobal = async () => {
        const token = useAdminAuth.getState().token;
        if (!token) {
            setGlobalMessage("Missing admin token.");
            return;
        }

        setSettingsLoading(true);
        setGlobalMessage(null);
        try {
            await adminCmsService.updateSettings(token, [
                { key: "store_name", value: globalConfig.storeName },
                { key: "support_email", value: globalConfig.supportEmail },
                { key: "support_phone", value: globalConfig.supportPhone },
                { key: "order_prefix", value: globalConfig.orderPrefix },
                { key: "currency", value: globalConfig.currency },
                { key: "timezone", value: globalConfig.timezone },
                { key: "maintenance_mode", value: String(globalConfig.maintenanceMode) },
            ]);
            setGlobalMessage("Global configuration saved.");
        } catch {
            setGlobalMessage("Failed to save global configuration.");
        } finally {
            setSettingsLoading(false);
        }
    };

    const handleSaveAdvanced = async () => {
        const token = useAdminAuth.getState().token;
        if (!token) {
            setAdvancedMessage("Missing admin token.");
            return;
        }

        setSettingsLoading(true);
        setAdvancedMessage(null);
        try {
            await adminCmsService.updateSettings(token, [
                { key: "enable_guest_checkout", value: String(advancedConfig.enableGuestCheckout) },
                { key: "min_order_value", value: String(advancedConfig.minOrderValue) },
                { key: "tax_rate", value: String(advancedConfig.taxRate) },
                { key: "inventory_tracking", value: String(advancedConfig.inventoryTracking) },
                { key: "low_stock_threshold", value: String(advancedConfig.lowStockThreshold) },
                { key: "enable_reviews", value: String(advancedConfig.enableReviews) },
                { key: "allow_preorder", value: String(advancedConfig.allowPreorder) },
                { key: "analytics_enabled", value: String(advancedConfig.analyticsEnabled) },
            ]);
            setAdvancedMessage("Advanced configuration saved.");
        } catch {
            setAdvancedMessage("Failed to save advanced configuration.");
        } finally {
            setSettingsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-8 animate-slide-up-fade">
            <div>
                <h1 className="font-display text-3xl font-bold text-dark tracking-tight">Admin Settings</h1>
                <p className="text-sm text-dark/50 mt-1">Manage your admin profile, notifications, and security.</p>
            </div>

            <div className="flex flex-wrap gap-2 rounded-2xl bg-white p-2 shadow-sm border border-secondary/10">
                <button
                    type="button"
                    onClick={() => setActiveTab("profile")}
                    className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${activeTab === "profile" ? "bg-secondary/10 text-dark" : "text-dark/50 hover:text-dark"}`}
                >
                    <User className="mr-2 inline h-4 w-4" /> Profile
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("preferences")}
                    className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${activeTab === "preferences" ? "bg-secondary/10 text-dark" : "text-dark/50 hover:text-dark"}`}
                >
                    <Bell className="mr-2 inline h-4 w-4" /> Preferences
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("security")}
                    className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${activeTab === "security" ? "bg-secondary/10 text-dark" : "text-dark/50 hover:text-dark"}`}
                >
                    <Lock className="mr-2 inline h-4 w-4" /> Security
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("global")}
                    className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${activeTab === "global" ? "bg-secondary/10 text-dark" : "text-dark/50 hover:text-dark"}`}
                >
                    <Globe className="mr-2 inline h-4 w-4" /> Global
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("advanced")}
                    className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${activeTab === "advanced" ? "bg-secondary/10 text-dark" : "text-dark/50 hover:text-dark"}`}
                >
                    <Sliders className="mr-2 inline h-4 w-4" /> Advanced
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("system")}
                    className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${activeTab === "system" ? "bg-secondary/10 text-dark" : "text-dark/50 hover:text-dark"}`}
                >
                    <Settings className="mr-2 inline h-4 w-4" /> System
                </button>
            </div>

            {activeTab === "profile" ? (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr]">
                    <div className="rounded-[2rem] bg-white p-6 md:p-8 border border-secondary/10 shadow-sm space-y-5">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-lg font-bold text-accent">
                                {adminInitials}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-dark">Administrator Profile</p>
                                <p className="text-xs text-dark/50">Changes are stored locally for this browser.</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-dark/50">Display Name</label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(event) => setDisplayName(event.target.value)}
                                placeholder="Admin name"
                                className="w-full rounded-xl border border-secondary/20 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-dark/50">Email</label>
                            <input
                                type="email"
                                value={admin?.email ?? ""}
                                disabled
                                className="w-full rounded-xl border border-secondary/20 bg-secondary/5 px-4 py-3 text-sm text-dark/60"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-dark/50">Role</label>
                            <input
                                type="text"
                                value={admin?.role ?? ""}
                                disabled
                                className="w-full rounded-xl border border-secondary/20 bg-secondary/5 px-4 py-3 text-sm text-dark/60"
                            />
                        </div>

                        {profileMessage ? <p className="text-sm font-medium text-dark/60">{profileMessage}</p> : null}

                        <Button type="button" variant="primary" size="lg" className="rounded-2xl" onClick={handleSaveProfile}>
                            Save Profile
                        </Button>
                    </div>

                    <div className="rounded-[2rem] bg-primary/20 p-6 md:p-8 border border-primary/30 space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-dark">Profile Tips</h3>
                        <div className="flex items-center gap-3 text-sm text-dark/70">
                            <Shield className="h-4 w-4 text-accent" /> Keep your admin name consistent across teams.
                        </div>
                        <div className="flex items-center gap-3 text-sm text-dark/70">
                            <Shield className="h-4 w-4 text-accent" /> Use secure devices when accessing the admin panel.
                        </div>
                    </div>
                </div>
            ) : null}

            {activeTab === "preferences" ? (
                <div className="rounded-[2rem] bg-white p-6 md:p-8 border border-secondary/10 shadow-sm space-y-6">
                    <div>
                        <h3 className="font-bold text-lg text-dark">Notification Preferences</h3>
                        <p className="text-xs text-dark/50">Control which updates you want to receive.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {[
                            { key: "notifyOrders", label: "New orders", description: "Get alerted when new orders arrive." },
                            { key: "notifyPayments", label: "Payment updates", description: "Receive payment confirmation alerts." },
                            { key: "notifyRequests", label: "Custom requests", description: "Stay on top of custom requests." },
                            { key: "notifyReviews", label: "New reviews", description: "Alerts when reviews are submitted." },
                            { key: "weeklyDigest", label: "Weekly digest", description: "Summary of store performance." },
                        ].map((item) => (
                            <label key={item.key} className="flex items-start gap-3 rounded-2xl border border-secondary/10 p-4">
                                <input
                                    type="checkbox"
                                    className="mt-1 h-4 w-4 accent-accent"
                                    checked={preferences[item.key as keyof typeof preferences]}
                                    onChange={(event) =>
                                        setPreferences((current) => ({
                                            ...current,
                                            [item.key]: event.target.checked,
                                        }))
                                    }
                                />
                                <div>
                                    <p className="text-sm font-bold text-dark">{item.label}</p>
                                    <p className="text-xs text-dark/40">{item.description}</p>
                                </div>
                            </label>
                        ))}
                    </div>

                    {preferencesMessage ? <p className="text-sm font-medium text-dark/60">{preferencesMessage}</p> : null}

                    <Button type="button" variant="primary" size="lg" className="rounded-2xl" onClick={handleSavePreferences}>
                        Save Preferences
                    </Button>
                </div>
            ) : null}

            {activeTab === "security" ? (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr]">
                    <form onSubmit={handlePasswordSubmit} className="rounded-[2rem] bg-white p-6 md:p-8 border border-secondary/10 shadow-sm space-y-5">
                        <div>
                            <h3 className="font-bold text-lg text-dark">Password Reset</h3>
                            <p className="text-xs text-dark/50">Update your administrator password.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-dark/50">Current Password</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                                className="w-full rounded-xl border border-secondary/20 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-dark/50">New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                minLength={8}
                                required
                                className="w-full rounded-xl border border-secondary/20 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-dark/50">Confirm New Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                minLength={8}
                                required
                                className="w-full rounded-xl border border-secondary/20 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                            />
                        </div>

                        {securityError ? <p className="text-sm font-medium text-red-600">{securityError}</p> : null}
                        {securitySuccess ? <p className="text-sm font-medium text-green-600">{securitySuccess}</p> : null}

                        <Button type="submit" variant="primary" size="lg" className="rounded-2xl" disabled={securityLoading}>
                            {securityLoading ? "Updating..." : "Update Password"}
                        </Button>
                    </form>

                    <div className="rounded-[2rem] bg-primary/20 p-6 md:p-8 border border-primary/30 space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-dark">Security Tips</h3>
                        <div className="flex items-center gap-3 text-sm text-dark/70">
                            <Shield className="h-4 w-4 text-accent" /> Use at least 12 characters for better protection.
                        </div>
                        <div className="flex items-center gap-3 text-sm text-dark/70">
                            <Shield className="h-4 w-4 text-accent" /> Change passwords every quarter.
                        </div>
                    </div>
                </div>
            ) : null}

            {activeTab === "global" ? (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr]">
                    <div className="rounded-[2rem] bg-white p-6 md:p-8 border border-secondary/10 shadow-sm space-y-6">
                        <div>
                            <h3 className="font-bold text-lg text-dark">Global Configuration</h3>
                            <p className="text-xs text-dark/50">Storewide identity, communication, and operational defaults.</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-dark/50">Store Name</label>
                                <input
                                    type="text"
                                    value={globalConfig.storeName}
                                    onChange={(event) => setGlobalConfig((current) => ({ ...current, storeName: event.target.value }))}
                                    className="w-full rounded-xl border border-secondary/20 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-dark/50">Support Email</label>
                                <input
                                    type="email"
                                    value={globalConfig.supportEmail}
                                    onChange={(event) => setGlobalConfig((current) => ({ ...current, supportEmail: event.target.value }))}
                                    className="w-full rounded-xl border border-secondary/20 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-dark/50">Support Phone</label>
                                <input
                                    type="text"
                                    value={globalConfig.supportPhone}
                                    onChange={(event) => setGlobalConfig((current) => ({ ...current, supportPhone: event.target.value }))}
                                    className="w-full rounded-xl border border-secondary/20 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-dark/50">Order Prefix</label>
                                <input
                                    type="text"
                                    value={globalConfig.orderPrefix}
                                    onChange={(event) => setGlobalConfig((current) => ({ ...current, orderPrefix: event.target.value.toUpperCase() }))}
                                    className="w-full rounded-xl border border-secondary/20 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-dark/50">Currency</label>
                                <input
                                    type="text"
                                    value={globalConfig.currency}
                                    onChange={(event) => setGlobalConfig((current) => ({ ...current, currency: event.target.value.toUpperCase() }))}
                                    className="w-full rounded-xl border border-secondary/20 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-dark/50">Timezone</label>
                                <input
                                    type="text"
                                    value={globalConfig.timezone}
                                    onChange={(event) => setGlobalConfig((current) => ({ ...current, timezone: event.target.value }))}
                                    className="w-full rounded-xl border border-secondary/20 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                                />
                            </div>
                        </div>

                        <label className="flex items-center gap-3 rounded-2xl border border-secondary/10 p-4">
                            <input
                                type="checkbox"
                                className="h-4 w-4 accent-accent"
                                checked={globalConfig.maintenanceMode}
                                onChange={(event) => setGlobalConfig((current) => ({ ...current, maintenanceMode: event.target.checked }))}
                            />
                            <div>
                                <p className="text-sm font-bold text-dark">Maintenance mode</p>
                                <p className="text-xs text-dark/40">Temporarily pause storefront access.</p>
                            </div>
                        </label>

                        {globalMessage ? <p className="text-sm font-medium text-dark/60">{globalMessage}</p> : null}

                        <Button
                            type="button"
                            variant="primary"
                            size="lg"
                            className="rounded-2xl"
                            onClick={() => void handleSaveGlobal()}
                            disabled={settingsLoading}
                        >
                            {settingsLoading ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save Global Settings</>}
                        </Button>
                    </div>

                    <div className="rounded-[2rem] bg-primary/20 p-6 md:p-8 border border-primary/30 space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-dark">Global Notes</h3>
                        <div className="flex items-center gap-3 text-sm text-dark/70">
                            <Shield className="h-4 w-4 text-accent" /> Keep support channels updated for customers.
                        </div>
                        <div className="flex items-center gap-3 text-sm text-dark/70">
                            <Shield className="h-4 w-4 text-accent" /> Use a short prefix for order numbers.
                        </div>
                    </div>
                </div>
            ) : null}

            {activeTab === "advanced" ? (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr]">
                    <div className="rounded-[2rem] bg-white p-6 md:p-8 border border-secondary/10 shadow-sm space-y-6">
                        <div>
                            <h3 className="font-bold text-lg text-dark">Advanced Configuration</h3>
                            <p className="text-xs text-dark/50">Operational controls and performance settings.</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <label className="flex items-start gap-3 rounded-2xl border border-secondary/10 p-4">
                                <input
                                    type="checkbox"
                                    className="mt-1 h-4 w-4 accent-accent"
                                    checked={advancedConfig.enableGuestCheckout}
                                    onChange={(event) => setAdvancedConfig((current) => ({ ...current, enableGuestCheckout: event.target.checked }))}
                                />
                                <div>
                                    <p className="text-sm font-bold text-dark">Guest checkout</p>
                                    <p className="text-xs text-dark/40">Allow orders without creating accounts.</p>
                                </div>
                            </label>
                            <label className="flex items-start gap-3 rounded-2xl border border-secondary/10 p-4">
                                <input
                                    type="checkbox"
                                    className="mt-1 h-4 w-4 accent-accent"
                                    checked={advancedConfig.enableReviews}
                                    onChange={(event) => setAdvancedConfig((current) => ({ ...current, enableReviews: event.target.checked }))}
                                />
                                <div>
                                    <p className="text-sm font-bold text-dark">Enable reviews</p>
                                    <p className="text-xs text-dark/40">Collect customer review feedback.</p>
                                </div>
                            </label>
                            <label className="flex items-start gap-3 rounded-2xl border border-secondary/10 p-4">
                                <input
                                    type="checkbox"
                                    className="mt-1 h-4 w-4 accent-accent"
                                    checked={advancedConfig.allowPreorder}
                                    onChange={(event) => setAdvancedConfig((current) => ({ ...current, allowPreorder: event.target.checked }))}
                                />
                                <div>
                                    <p className="text-sm font-bold text-dark">Allow pre-orders</p>
                                    <p className="text-xs text-dark/40">Enable Pre-Order products in the catalog.</p>
                                </div>
                            </label>
                            <label className="flex items-start gap-3 rounded-2xl border border-secondary/10 p-4">
                                <input
                                    type="checkbox"
                                    className="mt-1 h-4 w-4 accent-accent"
                                    checked={advancedConfig.analyticsEnabled}
                                    onChange={(event) => setAdvancedConfig((current) => ({ ...current, analyticsEnabled: event.target.checked }))}
                                />
                                <div>
                                    <p className="text-sm font-bold text-dark">Analytics tracking</p>
                                    <p className="text-xs text-dark/40">Enable dashboard analytics collection.</p>
                                </div>
                            </label>
                            <label className="flex items-start gap-3 rounded-2xl border border-secondary/10 p-4">
                                <input
                                    type="checkbox"
                                    className="mt-1 h-4 w-4 accent-accent"
                                    checked={advancedConfig.inventoryTracking}
                                    onChange={(event) => setAdvancedConfig((current) => ({ ...current, inventoryTracking: event.target.checked }))}
                                />
                                <div>
                                    <p className="text-sm font-bold text-dark">Inventory tracking</p>
                                    <p className="text-xs text-dark/40">Enable stock monitoring and alerts.</p>
                                </div>
                            </label>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-dark/50">Min Order Value (ETB)</label>
                                <input
                                    type="number"
                                    min={0}
                                    value={advancedConfig.minOrderValue}
                                    onChange={(event) => setAdvancedConfig((current) => ({
                                        ...current,
                                        minOrderValue: Number(event.target.value),
                                    }))}
                                    className="w-full rounded-xl border border-secondary/20 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-dark/50">Tax Rate (%)</label>
                                <input
                                    type="number"
                                    min={0}
                                    step="0.1"
                                    value={advancedConfig.taxRate}
                                    onChange={(event) => setAdvancedConfig((current) => ({
                                        ...current,
                                        taxRate: Number(event.target.value),
                                    }))}
                                    className="w-full rounded-xl border border-secondary/20 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-dark/50">Low Stock Threshold</label>
                                <input
                                    type="number"
                                    min={0}
                                    value={advancedConfig.lowStockThreshold}
                                    onChange={(event) => setAdvancedConfig((current) => ({
                                        ...current,
                                        lowStockThreshold: Number(event.target.value),
                                    }))}
                                    className="w-full rounded-xl border border-secondary/20 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                                />
                            </div>
                        </div>

                        {advancedMessage ? <p className="text-sm font-medium text-dark/60">{advancedMessage}</p> : null}

                        <Button
                            type="button"
                            variant="primary"
                            size="lg"
                            className="rounded-2xl"
                            onClick={() => void handleSaveAdvanced()}
                            disabled={settingsLoading}
                        >
                            {settingsLoading ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save Advanced Settings</>}
                        </Button>
                    </div>

                    <div className="rounded-[2rem] bg-primary/20 p-6 md:p-8 border border-primary/30 space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-dark">Advanced Notes</h3>
                        <div className="flex items-center gap-3 text-sm text-dark/70">
                            <Shield className="h-4 w-4 text-accent" /> Lower thresholds to increase stock alerts.
                        </div>
                        <div className="flex items-center gap-3 text-sm text-dark/70">
                            <Shield className="h-4 w-4 text-accent" /> Disable analytics for privacy-sensitive deployments.
                        </div>
                    </div>
                </div>
            ) : null}

            {activeTab === "system" ? (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr]">
                    <div className="rounded-[2rem] bg-white p-6 md:p-8 border border-secondary/10 shadow-sm space-y-5">
                        <div>
                            <h3 className="font-bold text-lg text-dark">System Information</h3>
                            <p className="text-xs text-dark/50">Environment details for diagnostics.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-dark/50">API Base URL</label>
                            <input
                                type="text"
                                value={apiBaseUrl}
                                disabled
                                className="w-full rounded-xl border border-secondary/20 bg-secondary/5 px-4 py-3 text-sm text-dark/60"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-dark/50">Session</label>
                            <div className="flex flex-wrap gap-2">
                                <Button type="button" variant="outline" className="rounded-xl" onClick={() => void handleRefreshSession()}>
                                    <RefreshCw className="mr-2 h-4 w-4" /> Refresh Session
                                </Button>
                                <Button type="button" variant="outline" className="rounded-xl" onClick={handleClearLocal}>
                                    Clear Local Settings
                                </Button>
                            </div>
                        </div>

                        {systemMessage ? <p className="text-sm font-medium text-dark/60">{systemMessage}</p> : null}
                    </div>

                    <div className="rounded-[2rem] bg-white p-6 md:p-8 border border-secondary/10 shadow-sm space-y-4">
                        <div>
                            <h3 className="font-bold text-lg text-dark">Sign Out</h3>
                            <p className="text-xs text-dark/50">End this admin session on this device.</p>
                        </div>
                        <Button type="button" variant="ghost" className="w-full rounded-2xl text-red-500 hover:bg-red-50" onClick={handleLogout}>
                            Sign Out
                        </Button>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
