"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/store/useAdminAuth";
import { Shield, Lock, AlertCircle, CheckCircle2, ChevronRight, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminLoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const login = useAdminAuth((s) => s.login);
    const isAuthenticated = useAdminAuth((s) => s.isAuthenticated);
    const router = useRouter();

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated) {
            router.push("/admin/dashboard");
        }
    }, [isAuthenticated, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        // Artifical delay for security feel
        await new Promise(resolve => setTimeout(resolve, 800));

        const ok = await login(username, password);

        if (ok) {
            setSuccess(true);
            setTimeout(() => {
                router.push("/admin/dashboard");
            }, 500);
        } else {
            setError("Invalid credentials. Access denied.");
            setLoading(false);
        }
    };

    if (isAuthenticated && !success) return null; // Prevent flash

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 z-0 opacity-20"
                style={{
                    backgroundImage: "radial-gradient(#334155 1px, transparent 1px)",
                    backgroundSize: "32px 32px"
                }}
            />

            <div className={`relative z-10 w-full max-w-md transition-all duration-500 ${success ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>
                {/* Security Badge */}
                <div className="flex justify-center mb-8">
                    <div className="h-20 w-20 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center shadow-2xl shadow-black/50">
                        <Shield className="h-10 w-10 text-emerald-500" />
                    </div>
                </div>

                {/* Login Card */}
                <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800/50 rounded-3xl p-8 shadow-2xl">
                    <div className="mb-8 text-center">
                        <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Admin Console</h1>
                        <p className="text-slate-400 text-sm">Restricted access. Authorized personnel only.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Username</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors">
                                    <LayoutDashboard className="h-5 w-5" />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-slate-950 border-2 border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-700 focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                                    placeholder="Enter ID"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-950 border-2 border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-700 focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all font-mono"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                                <p className="text-red-400 text-sm font-medium">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || success}
                            className={cn(
                                "w-full h-12 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300",
                                loading
                                    ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 hover:scale-[1.02] active:scale-[0.98]"
                            )}
                        >
                            {loading ? (
                                <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : success ? (
                                <>
                                    <CheckCircle2 className="h-5 w-5" />
                                    Access Granted
                                </>
                            ) : (
                                <>
                                    Authenticate
                                    <ChevronRight className="h-4 w-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-800/50 text-center">
                        <p className="text-[10px] text-slate-600 font-mono">
                            SECURE SYSTEM // IP LOGGED // ENCRYPTED CONNECTION
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
