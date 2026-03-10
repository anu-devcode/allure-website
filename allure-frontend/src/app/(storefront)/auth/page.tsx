"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCustomerAuth } from "@/store/useCustomerAuth";
import { Mail, Lock, User, Phone, Eye, EyeOff, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { usePersistentDraft } from "@/hooks/usePersistentDraft";
import { AutosaveIndicator } from "@/components/ui/autosave-indicator";

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

    const handleRestore = useCallback((draft: {
        mode: "login" | "register";
        email: string;
        name: string;
        phone: string;
    }) => {
        setMode(draft.mode ?? "login");
        setEmail(draft.email ?? "");
        setName(draft.name ?? "");
        setPhone(draft.phone ?? "");
    }, []);

    const { saveState, restored, clearDraft } = usePersistentDraft({
        storageKey: "allure-customer-auth-draft-v1",
        value: {
            mode,
            email,
            name,
            phone,
        },
        onRestore: handleRestore,
    });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const success = await login(email, password);
            if (success) {
                clearDraft();
                router.push("/account");
            } else {
                setError("Invalid email or password. Please try again.");
            }
        } catch {
            setError("Could not sign in right now. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setIsLoading(true);
        try {
            const success = await register(name, email, phone, password);
            if (success) {
                clearDraft();
                router.push("/account");
            } else {
                setError("Could not create account. Please check your details.");
            }
        } catch {
            setError("Could not create account right now. Please try again.");
        } finally {
            setIsLoading(false);
        }
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
                                ? "Sign in to track your orders and manage your account. Guest orders placed with your phone number will sync automatically."
                                : "Join Allure to start shopping and track your orders. If you already ordered as a guest, use the same phone number to sync them automatically."}
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
                        <AutosaveIndicator saveState={saveState} restored={restored} className="mb-6" />
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium border border-red-100 flex items-center gap-3">
                                <span className="h-1.5 w-1.5 rounded-full bg-red-500 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        {/* Social Auth */}
                        <div className="flex flex-col gap-4 mb-8">
                            <button
                                type="button"
                                className="flex h-13 w-full items-center justify-center gap-3 rounded-2xl border border-secondary/10 bg-white px-6 text-sm font-bold text-dark transition-all hover:bg-secondary/5 hover:border-secondary/20 active:scale-[0.98]"
                            >
                                <svg className="h-5 w-5" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                <span>Continue with Google</span>
                            </button>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    className="flex h-13 items-center justify-center gap-3 rounded-2xl border border-secondary/10 bg-white px-4 text-sm font-bold text-dark transition-all hover:bg-secondary/5 hover:border-secondary/20 active:scale-[0.98]"
                                >
                                    <svg className="h-5 w-5 fill-[#24A1DE]" viewBox="0 0 24 24">
                                        <path d="M11.944 0C5.352 0 0 5.352 0 12s5.352 12 12 12 12-5.352 12-12S18.592 0 11.944 0zm5.812 8.352l-1.996 9.408c-.144.672-.544.832-1.12.512l-3.04-2.24-1.468 1.416c-.16.16-.296.296-.608.296l.216-3.112 5.672-5.128c.248-.224-.056-.344-.384-.128l-7.016 4.416-3.016-.944c-.656-.208-.672-.656.136-.976l11.776-4.544c.544-.208 1.024.12.832.912z" />
                                    </svg>
                                    <span>Telegram</span>
                                </button>
                                <button
                                    type="button"
                                    className="flex h-13 items-center justify-center gap-3 rounded-2xl border border-secondary/10 bg-white px-4 text-sm font-bold text-dark transition-all hover:bg-secondary/5 hover:border-secondary/20 active:scale-[0.98]"
                                >
                                    <svg className="h-5 w-5 fill-[#1877F2]" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                    <span>Facebook</span>
                                </button>
                            </div>
                        </div>

                        {/* Separator */}
                        <div className="relative mb-8 text-center">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-secondary/10"></span>
                            </div>
                            <span className="relative bg-white px-4 text-xs font-black uppercase tracking-[0.2em] text-dark/20">
                                or use email
                            </span>
                        </div>

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
                                    <div className="flex items-center justify-between ml-1">
                                        <label className="text-xs font-black uppercase tracking-[0.2em] text-dark/40">Password</label>
                                        <Link href="/auth/forgot-password" className="text-xs text-accent font-bold hover:underline">
                                            Forgot Password?
                                        </Link>
                                    </div>
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

                                <div className="flex items-center gap-2 ml-1">
                                    <div className="relative h-5 w-5">
                                        <input
                                            type="checkbox"
                                            id="remember-me"
                                            className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-secondary/20 transition-all checked:bg-accent checked:border-accent"
                                        />
                                        <CheckCircle2 className="pointer-events-none absolute left-0 top-0 h-5 w-5 scale-0 text-white transition-all peer-checked:scale-100" />
                                    </div>
                                    <label htmlFor="remember-me" className="text-xs font-bold text-dark/60 cursor-pointer select-none">
                                        Remember me
                                    </label>
                                </div>

                                <Button
                                    variant="primary"
                                    size="lg"
                                    className="h-14 rounded-2xl gap-3 text-base font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] mt-2 border-none"
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
                                    className="h-14 rounded-2xl gap-3 text-base font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] mt-2 border-none"
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

                        <div className="mt-8 pt-8 border-t border-secondary/10 text-center">
                            <p className="text-xs text-dark/40 leading-relaxed">
                                By continuing, you agree to Allure's{" "}
                                <Link href="/terms" className="text-accent font-bold hover:underline">Terms of Service</Link>
                                {" "}and{" "}
                                <Link href="/rules" className="text-accent font-bold hover:underline">Privacy Policy</Link>.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
