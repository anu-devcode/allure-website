"use client";

import { FormEvent, useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { customerAuthService } from "@/services/customerAuthService";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Sparkles } from "lucide-react";
import { usePersistentDraft } from "@/hooks/usePersistentDraft";
import { AutosaveIndicator } from "@/components/ui/autosave-indicator";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [resetToken, setResetToken] = useState<string | null>(null);

    const handleRestore = useCallback((draft: { email: string }) => {
        setEmail(draft.email ?? "");
    }, []);

    const { saveState, restored, clearDraft } = usePersistentDraft({
        storageKey: "allure-forgot-password-draft-v1",
        value: { email },
        onRestore: handleRestore,
    });

    const resetLink = useMemo(() => {
        if (!resetToken) {
            return null;
        }

        return `/auth/reset-password?token=${encodeURIComponent(resetToken)}`;
    }, [resetToken]);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError("");
        setMessage("");
        setResetToken(null);
        setLoading(true);

        try {
            const result = await customerAuthService.forgotPassword(email);
            setMessage(result.message || "If the email exists, a reset link has been generated.");
            setResetToken(result.resetToken ?? null);
            clearDraft();
        } catch {
            setError("Unable to process your request right now. Please try again shortly.");
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
                            Forgot Password
                        </h1>
                        <p className="max-w-md text-sm text-dark/50 md:text-base">
                            Enter your email and we will generate a password reset token.
                        </p>
                    </div>
                </div>
            </section>

            <section className="container mx-auto px-4 py-10 md:py-14">
                <div className="mx-auto max-w-md rounded-[2.5rem] bg-white p-8 md:p-10 shadow-2xl shadow-secondary/10 border border-secondary/10 animate-slide-up-fade">
                    <AutosaveIndicator saveState={saveState} restored={restored} className="mb-6" />
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
                            <label className="text-xs font-black uppercase tracking-[0.2em] text-dark/40 ml-1">Email</label>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-dark/20 group-focus-within:text-accent transition-colors">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <input
                                    required
                                    type="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    placeholder="you@example.com"
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
                            {loading ? "Generating..." : "Send Reset Link"}
                        </Button>
                    </form>

                    {resetLink ? (
                        <div className="mt-6 rounded-2xl border border-secondary/10 bg-secondary/5 p-4 text-xs text-dark/60">
                            Development token generated. Continue with{" "}
                            <Link className="font-bold text-accent hover:underline" href={resetLink}>
                                Reset Password
                            </Link>
                            .
                        </div>
                    ) : null}

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
