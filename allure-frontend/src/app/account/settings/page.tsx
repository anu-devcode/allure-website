"use client";

import { Settings, Bell, Globe, Shield } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="animate-slide-up-fade">
            <div className="mb-8">
                <h1 className="font-display text-2xl font-bold text-dark tracking-tight md:text-3xl">Settings</h1>
                <p className="text-sm text-dark/50 mt-1">Manage your account preferences.</p>
            </div>

            <div className="flex flex-col gap-4">
                <div className="rounded-2xl bg-white p-6 border border-secondary/10 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-11 w-11 rounded-xl bg-accent/5 flex items-center justify-center flex-shrink-0">
                            <Bell className="h-4.5 w-4.5 text-accent/40" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-dark">Notifications</p>
                            <p className="text-xs text-dark/40 mt-0.5">Manage email and push notifications</p>
                        </div>
                        <div className="h-6 w-11 rounded-full bg-accent/20 p-0.5 cursor-pointer">
                            <div className="h-5 w-5 rounded-full bg-accent shadow-sm transition-transform translate-x-5" />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl bg-white p-6 border border-secondary/10 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-11 w-11 rounded-xl bg-accent/5 flex items-center justify-center flex-shrink-0">
                            <Globe className="h-4.5 w-4.5 text-accent/40" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-dark">Language</p>
                            <p className="text-xs text-dark/40 mt-0.5">English</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl bg-white p-6 border border-secondary/10 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-11 w-11 rounded-xl bg-accent/5 flex items-center justify-center flex-shrink-0">
                            <Shield className="h-4.5 w-4.5 text-accent/40" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-dark">Privacy</p>
                            <p className="text-xs text-dark/40 mt-0.5">Manage your data and privacy settings</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl bg-white p-6 border border-secondary/10 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-11 w-11 rounded-xl bg-accent/5 flex items-center justify-center flex-shrink-0">
                            <Settings className="h-4.5 w-4.5 text-accent/40" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-dark">Account</p>
                            <p className="text-xs text-dark/40 mt-0.5">Manage your account details</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
