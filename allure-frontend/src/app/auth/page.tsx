"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCustomerAuth } from "@/store/useCustomerAuth";
import { Mail, Lock, User, Phone, Eye, EyeOff, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

export default function CustomerAuthPage() {
    const [mode, setMode] = useState<"login" | "register">("login");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Login fields
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Register fields
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const login = useCustomerAuth((s) => s.login);
    const register = useCustomerAuth((s) => s.register);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        const success = await login(email, password);
        if (success) {
            router.push("/account");
        } else {
            setError("Invalid email or password. Please try again.");
        }
        setIsLoading(false);
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 4) {
            setError("Password must be at least 4 characters.");
            return;
        }

        setIsLoading(true);
        const success = await register(name, email, phone, password);
        if (success) {
            router.push("/account");
        } else {
            setError("Could not create account. Please check your details.");
        }
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col gap-0 overflow-x-hidden">
            {/* Hero */}
            <section className="relative overflow-hidden bg-cream px-4 py-12 md:py-16">
                <div className="container relative z-10 mx-auto text-center">
                    <div className="animate-slide-up-fade flex flex-col items-center gap-3">
                        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-accent border border-primary/20">
                            <Sparkles className="h-3 w-3" />
                            My Account
                        </div>
                        <h1 className="font-display text-3xl font-bold text-dark md:text-5xl tracking-tight leading-[1.1]">
                            {mode === "login" ? "Welcome Back" : "Create Account"}
                        </h1>
                        <p className="max-w-md text-sm text-dark/50 md:text-base">
                            {mode === "login"
                                ? "Sign in to track your orders and manage your account."
                                : "Join Allure to start shopping and track your orders."}
                        </p>
                    </div>
                </div>
                <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-secondary/5 blur-3xl" />
            </section>

            {/* Auth Form */}
            <section className="container mx-auto px-4 py-10 md:py-14">
                <div className="mx-auto max-w-md">
                    {/* Tabs */}
                    <div className="flex rounded-2xl bg-secondary/5 border border-secondary/10 p-1 mb-8">
                        <button
                            onClick={() => { setMode("login"); setError(""); }}
                            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${mode === "login" ? "bg-white text-dark shadow-sm" : "text-dark/40 hover:text-dark/60"}`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => { setMode("register"); setError(""); }}
                            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${mode === "register" ? "bg-white text-dark shadow-sm" : "text-dark/40 hover:text-dark/60"}`}
                        >
                            Create Account
                        </button>
                    </div>

                    {/* Form Card */}
                    <div className="rounded-[2.5rem] bg-white p-8 md:p-10 shadow-2xl shadow-secondary/10 border border-secondary/10 animate-slide-up-fade">
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium border border-red-100">
                                {error}
                            </div>
                        )}

                        {mode === "login" ? (
                            <form onSubmit={handleLogin} className="flex flex-col gap-6">
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
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@example.com"
                                            className="h-14 w-full rounded-2xl border-2 border-secondary/10 bg-white pl-14 pr-6 text-sm text-dark focus:border-accent focus:outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <label className="text-xs font-black uppercase tracking-[0.2em] text-dark/40 ml-1">Password</label>
                                    <div className="relative group">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-dark/20 group-focus-within:text-accent transition-colors">
                                            <Lock className="h-5 w-5" />
                                        </div>
                                        <input
                                            required
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="h-14 w-full rounded-2xl border-2 border-secondary/10 bg-white pl-14 pr-14 text-sm text-dark focus:border-accent focus:outline-none transition-all shadow-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-5 top-1/2 -translate-y-1/2 text-dark/20 hover:text-dark/50 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                <Button
                                    variant="primary"
                                    size="lg"
                                    className="h-14 rounded-2xl gap-3 text-base font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] mt-2"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            <span>Signing in...</span>
                                        </div>
                                    ) : (
                                        <>Sign In <ArrowRight className="h-4 w-4" /></>
                                    )}
                                </Button>
                            </form>
                        ) : (
                            <form onSubmit={handleRegister} className="flex flex-col gap-5">
                                <div className="flex flex-col gap-3">
                                    <label className="text-xs font-black uppercase tracking-[0.2em] text-dark/40 ml-1">Full Name</label>
                                    <div className="relative group">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-dark/20 group-focus-within:text-accent transition-colors">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <input
                                            required
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="e.g. Abebe Kebede"
                                            className="h-14 w-full rounded-2xl border-2 border-secondary/10 bg-white pl-14 pr-6 text-sm text-dark focus:border-accent focus:outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                </div>

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
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@example.com"
                                            className="h-14 w-full rounded-2xl border-2 border-secondary/10 bg-white pl-14 pr-6 text-sm text-dark focus:border-accent focus:outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <label className="text-xs font-black uppercase tracking-[0.2em] text-dark/40 ml-1">Phone</label>
                                    <div className="relative group">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-dark/20 group-focus-within:text-accent transition-colors">
                                            <Phone className="h-5 w-5" />
                                        </div>
                                        <input
                                            required
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="e.g. 0911 223 344"
                                            className="h-14 w-full rounded-2xl border-2 border-secondary/10 bg-white pl-14 pr-6 text-sm text-dark focus:border-accent focus:outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="flex flex-col gap-3">
                                        <label className="text-xs font-black uppercase tracking-[0.2em] text-dark/40 ml-1">Password</label>
                                        <div className="relative group">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-dark/20 group-focus-within:text-accent transition-colors">
                                                <Lock className="h-5 w-5" />
                                            </div>
                                            <input
                                                required
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="••••••"
                                                className="h-14 w-full rounded-2xl border-2 border-secondary/10 bg-white pl-14 pr-6 text-sm text-dark focus:border-accent focus:outline-none transition-all shadow-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <label className="text-xs font-black uppercase tracking-[0.2em] text-dark/40 ml-1">Confirm</label>
                                        <div className="relative group">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-dark/20 group-focus-within:text-accent transition-colors">
                                                <Lock className="h-5 w-5" />
                                            </div>
                                            <input
                                                required
                                                type={showPassword ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="••••••"
                                                className="h-14 w-full rounded-2xl border-2 border-secondary/10 bg-white pl-14 pr-6 text-sm text-dark focus:border-accent focus:outline-none transition-all shadow-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    variant="primary"
                                    size="lg"
                                    className="h-14 rounded-2xl gap-3 text-base font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] mt-2"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            <span>Creating account...</span>
                                        </div>
                                    ) : (
                                        <>Create Account <ArrowRight className="h-4 w-4" /></>
                                    )}
                                </Button>
                            </form>
                        )}

                        <div className="mt-6 text-center">
                            <p className="text-xs text-dark/40">
                                By continuing, you agree to our{" "}
                                <Link href="/terms" className="text-accent hover:underline">Terms</Link>
                                {" "}and{" "}
                                <Link href="/rules" className="text-accent hover:underline">Policies</Link>.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
