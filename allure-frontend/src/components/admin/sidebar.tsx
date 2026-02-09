"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    ShoppingBag,
    Settings,
    LogOut,
    ChevronRight,
    Monitor
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminLinks = [
    { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { name: "Content", href: "/admin/content", icon: Monitor },
    { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-secondary/20 bg-white p-6 transition-transform">
            <div className="flex flex-col h-full gap-8">
                {/* Admin Logo */}
                <div className="flex items-center gap-2 px-2">
                    <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold">A</div>
                    <span className="font-display text-xl font-bold text-dark">Allure Admin</span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1">
                    {adminLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={cn(
                                    "flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all group",
                                    isActive
                                        ? "bg-primary text-dark"
                                        : "text-dark/60 hover:bg-secondary/10 hover:text-dark"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <link.icon className={cn("h-5 w-5", isActive ? "text-dark" : "text-dark/40 group-hover:text-dark/60")} />
                                    {link.name}
                                </div>
                                {isActive && <ChevronRight className="h-4 w-4" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer info/Logout */}
                <div className="border-t border-secondary/10 pt-6">
                    <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
                        <LogOut className="h-5 w-5" />
                        Logout
                    </button>
                </div>
            </div>
        </aside>
    );
}
