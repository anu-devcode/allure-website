"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { customerAuthService } from "@/services/customerAuthService";
import { Button } from "@/components/ui/button";
import { ArrowLeft, KeyRound, Lock, Sparkles } from "lucide-react";

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [token, setToken] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const tokenParam = searchParams.get("token");
        if (tokenParam) {
            setToken(tokenParam);
        }
    }, [searchParams]);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError("");
        setMessage("");

        if (!token.trim()) {
            setError("Reset token is required.");
            return;
        }

        if (newPassword.length < 8) {
            setError("New password must be at least 8 characters.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Password confirmation does not match.");
            return;
        }

        setLoading(true);

        try {
            const result = await customerAuthService.resetPassword(token.trim(), newPassword);
            setMessage(result.message || "Password reset successful.");
            setTimeout(() => {
                router.push("/auth");
            }, 900);
        } catch {
            setError("Reset failed. Token may be invalid or expired.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-0 overflow-x-hidden">
            <section className="relative overflow-hidden bg-cream px-4 py-12 md:py-16">
                <div className="container relative z-10 mx-auto text-center">
                    <div className="animate-slide-up-fade flex flex-col items-center gap-3">
                        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-accent border border-primary/20">
                            <Sparkles className="h-3 w-3" />
                            Account Recovery
                        </div>
                        <h1 className="font-display text-3xl font-bold text-dark md:text-5xl tracking-tight leading-[1.1]">
                            Reset Password
                        </h1>
                        <p className="max-w-md text-sm text-dark/50 md:text-base">
                            Set a new password for your account.
                        </p>
                    </div>
                </div>
            </section>

            <section className="container mx-auto px-4 py-10 md:py-14">
                <div className="mx-auto max-w-md rounded-[2.5rem] bg-white p-8 md:p-10 shadow-2xl shadow-secondary/10 border border-secondary/10 animate-slide-up-fade">
                    {error ? (
                        <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600">
                            {error}
                        </div>
                    ) : null}

                    {message ? (
                        <div className="mb-6 rounded-2xl border border-green-100 bg-green-50 p-4 text-sm font-medium text-green-700">
                            {message}
                        </div>
                    ) : null}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div className="flex flex-col gap-3">
                            <label className="text-xs font-black uppercase tracking-[0.2em] text-dark/40 ml-1">Reset Token</label>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-dark/20 group-focus-within:text-accent transition-colors">
                                    <KeyRound className="h-5 w-5" />
                                </div>
                                <input
                                    required
                                    type="text"
                                    value={token}
                                    onChange={(event) => setToken(event.target.value)}
                                    placeholder="Paste reset token"
                                    className="h-14 w-full rounded-2xl border-2 border-secondary/10 bg-white pl-14 pr-6 text-sm text-dark focus:border-accent focus:outline-none transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <label className="text-xs font-black uppercase tracking-[0.2em] text-dark/40 ml-1">New Password</label>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-dark/20 group-focus-within:text-accent transition-colors">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <input
                                    required
                                    type="password"
                                    value={newPassword}
                                    onChange={(event) => setNewPassword(event.target.value)}
                                    minLength={8}
                                    placeholder="••••••••"
                                    className="h-14 w-full rounded-2xl border-2 border-secondary/10 bg-white pl-14 pr-6 text-sm text-dark focus:border-accent focus:outline-none transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <label className="text-xs font-black uppercase tracking-[0.2em] text-dark/40 ml-1">Confirm Password</label>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-dark/20 group-focus-within:text-accent transition-colors">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <input
                                    required
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(event) => setConfirmPassword(event.target.value)}
                                    minLength={8}
                                    placeholder="••••••••"
                                    className="h-14 w-full rounded-2xl border-2 border-secondary/10 bg-white pl-14 pr-6 text-sm text-dark focus:border-accent focus:outline-none transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            className="h-14 rounded-2xl text-base font-bold border-none"
                            disabled={loading}
                        >
                            {loading ? "Updating..." : "Update Password"}
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-secondary/10">
                        <Link href="/auth" className="inline-flex items-center gap-2 text-sm font-bold text-accent hover:underline">
                            <ArrowLeft className="h-4 w-4" />
                            Back to sign in
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
