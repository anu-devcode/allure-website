"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/store/useAdminAuth";
import { useRouter } from "next/navigation";

export default function AdminSettingsPage() {
    const router = useRouter();
    const updatePassword = useAdminAuth((state) => state.updatePassword);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError("");
        setSuccess("");

        if (newPassword.length < 8) {
            setError("New password must be at least 8 characters.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Password confirmation does not match.");
            return;
        }

        setLoading(true);
        const ok = await updatePassword(currentPassword, newPassword);
        setLoading(false);

        if (!ok) {
            setError("Failed to update password. Check your current password and try again.");
            return;
        }

        setSuccess("Password updated. Please log in again.");
        setTimeout(() => {
            router.push("/admin/login");
        }, 900);
    };

    return (
        <div className="mx-auto max-w-2xl animate-slide-up-fade">
            <div className="mb-8">
                <h1 className="font-display text-2xl font-bold text-dark tracking-tight md:text-3xl">Admin Settings</h1>
                <p className="text-sm text-dark/50 mt-1">Update your administrator password.</p>
            </div>

            <form onSubmit={handleSubmit} className="rounded-[2rem] bg-white p-6 md:p-8 border border-secondary/10 shadow-sm space-y-5">
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

                {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
                {success ? <p className="text-sm font-medium text-green-600">{success}</p> : null}

                <Button type="submit" variant="primary" size="lg" className="rounded-2xl" disabled={loading}>
                    {loading ? "Updating..." : "Update Password"}
                </Button>
            </form>
        </div>
    );
}
