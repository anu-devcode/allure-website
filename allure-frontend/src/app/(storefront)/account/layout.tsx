"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useCustomerAuth } from "@/store/useCustomerAuth";
import {
    LayoutDashboard, User, Package, Heart, Settings, LogOut,
    Menu, X, ChevronRight, Clock, Check
} from "lucide-react";

const NAV_ITEMS = [
    { name: "Dashboard", href: "/account", icon: LayoutDashboard },
    { name: "Profile", href: "/account/profile", icon: User },
    { name: "My Orders", href: "/account/orders", icon: Package },
    { name: "Wishlist", href: "/account/wishlist", icon: Heart },
    { name: "Settings", href: "/account/settings", icon: Settings },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
    const user = useCustomerAuth((s) => s.user);
    const isAuthenticated = useCustomerAuth((s) => s.isAuthenticated);
    const rehydrateSession = useCustomerAuth((s) => s.rehydrateSession);
    const logout = useCustomerAuth((s) => s.logout);
    const router = useRouter();
    const pathname = usePathname();
    const [drawerOpen, setDrawerOpen] = useState(false);

    useEffect(() => {
        void rehydrateSession();
    }, [rehydrateSession]);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/auth");
        }
    }, [isAuthenticated, router]);

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    if (!isAuthenticated || !user) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            </div>
        );
    }

    const memberSince = new Date(user.joinedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
    });

    const isActive = (href: string) => {
        if (href === "/account") return pathname === "/account";
        return pathname.startsWith(href);
    };

    return (
        <div className="min-h-[70vh] animate-page-fade-in">
            {/* ─── Mobile Top Bar ──────────────────────────── */}
            <div className="lg:hidden border-b border-secondary/10 bg-white sticky top-16 z-30">
                <div className="container mx-auto px-4 flex items-center justify-between h-14">
                    <button
                        onClick={() => setDrawerOpen(true)}
                        className="flex items-center gap-2 text-sm font-bold text-dark/70 hover:text-accent transition-colors"
                    >
                        <Menu className="h-5 w-5" />
                        <span>Account Menu</span>
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-accent/10 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-accent">{user.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <span className="text-sm font-medium text-dark/60 hidden sm:block">{user.name}</span>
                    </div>
                </div>
            </div>

            {/* ─── Mobile Slide Drawer ─────────────────────── */}
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-dark/30 backdrop-blur-sm z-50 transition-opacity duration-300 lg:hidden ${drawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                onClick={() => setDrawerOpen(false)}
            />
            {/* Drawer Panel */}
            <div
                className={`fixed top-0 left-0 bottom-0 w-[280px] bg-white z-50 shadow-2xl transition-transform duration-300 ease-out lg:hidden flex flex-col ${drawerOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {/* Drawer Header */}
                <div className="p-6 border-b border-secondary/10">
                    <div className="flex items-center justify-between mb-4">
                        <span className="font-display text-lg font-bold text-accent">My Account</span>
                        <button
                            onClick={() => setDrawerOpen(false)}
                            className="h-8 w-8 rounded-full bg-secondary/10 flex items-center justify-center text-dark/40 hover:text-dark hover:bg-secondary/20 transition-all"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                                <span className="font-display text-lg font-bold text-accent">{user.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-accent text-white flex items-center justify-center">
                                <Check className="h-2.5 w-2.5" />
                            </div>
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-dark truncate">{user.name}</p>
                            <p className="text-xs text-dark/40 truncate">{user.email}</p>
                        </div>
                    </div>
                </div>

                {/* Drawer Nav */}
                <nav className="flex-1 p-3 overflow-y-auto">
                    <div className="flex flex-col gap-1">
                        {NAV_ITEMS.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setDrawerOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${active
                                            ? "bg-accent text-white font-bold shadow-md shadow-accent/20"
                                            : "text-dark/60 hover:bg-secondary/5 hover:text-dark"
                                        }`}
                                >
                                    <Icon className="h-4.5 w-4.5 flex-shrink-0" />
                                    {item.name}
                                    {active && <ChevronRight className="h-4 w-4 ml-auto" />}
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* Drawer Footer */}
                <div className="p-3 border-t border-secondary/10">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
                    >
                        <LogOut className="h-4.5 w-4.5" />
                        Sign Out
                    </button>
                </div>
            </div>

            {/* ─── Main Layout ─────────────────────────────── */}
            <div className="container mx-auto px-4 py-8 lg:py-12">
                <div className="flex gap-8 lg:gap-12">
                    {/* ─── Desktop Sidebar ─────────────────── */}
                    <aside className="hidden lg:block w-[260px] flex-shrink-0">
                        <div className="sticky top-24">
                            {/* User Card */}
                            <div className="rounded-[2rem] bg-white p-6 border border-secondary/10 shadow-sm mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="h-14 w-14 rounded-full bg-accent/10 border-2 border-white shadow-md flex items-center justify-center">
                                            <span className="font-display text-xl font-bold text-accent">{user.name.charAt(0).toUpperCase()}</span>
                                        </div>
                                        <div className="absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full bg-accent text-white flex items-center justify-center shadow-sm">
                                            <Check className="h-3 w-3" />
                                        </div>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-dark truncate">{user.name}</p>
                                        <p className="text-xs text-dark/40 truncate">{user.email}</p>
                                    </div>
                                </div>
                                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-accent border border-primary/15">
                                    <Clock className="h-2.5 w-2.5" />
                                    Since {memberSince}
                                </div>
                            </div>

                            {/* Navigation */}
                            <nav className="rounded-[2rem] bg-white p-3 border border-secondary/10 shadow-sm">
                                <div className="flex flex-col gap-1">
                                    {NAV_ITEMS.map((item) => {
                                        const Icon = item.icon;
                                        const active = isActive(item.href);
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 ${active
                                                        ? "bg-accent text-white font-bold shadow-md shadow-accent/20"
                                                        : "text-dark/60 hover:bg-secondary/5 hover:text-dark font-medium"
                                                    }`}
                                            >
                                                <Icon className={`h-4 w-4 flex-shrink-0 transition-transform duration-200 ${!active ? "group-hover:scale-110" : ""}`} />
                                                {item.name}
                                                {active && <ChevronRight className="h-4 w-4 ml-auto" />}
                                            </Link>
                                        );
                                    })}
                                </div>

                                <div className="my-2 h-px bg-secondary/10 mx-2" />

                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all duration-200 group"
                                >
                                    <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                    Sign Out
                                </button>
                            </nav>
                        </div>
                    </aside>

                    {/* ─── Content Area ─────────────────────── */}
                    <main className="flex-1 min-w-0">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
