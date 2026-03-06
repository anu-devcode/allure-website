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
    Monitor,
    Tags,
    MessageSquare,
    ClipboardList,
    Users,
    CreditCard,
    Star,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/store/useAdminAuth";

const adminLinks = [
    { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { name: "Payments", href: "/admin/payments", icon: CreditCard },
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Categories", href: "/admin/categories", icon: Tags },
    { name: "Reviews", href: "/admin/reviews", icon: Star },
    { name: "Custom Requests", href: "/admin/custom-requests", icon: ClipboardList },
    { name: "Contact", href: "/admin/contact", icon: MessageSquare },
    { name: "Content", href: "/admin/content", icon: Monitor },
    { name: "Settings", href: "/admin/settings", icon: Settings },
];

interface AdminSidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const logout = useAdminAuth((s) => s.logout);

    const handleLogout = () => {
        logout();
        router.push("/admin/login");
    };

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-dark/20 backdrop-blur-sm md:hidden"
                    onClick={onClose}
                />
            )}
            <aside className={cn(
                "fixed left-0 top-0 z-[60] h-screen w-64 border-r border-secondary/20 bg-white p-6 transition-transform md:z-50 md:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex flex-col h-full gap-8">
                    {/* Admin Logo */}
                    <div className="flex items-center justify-between gap-2 px-2">
                        <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold">A</div>
                        <span className="font-display text-xl font-bold text-dark">Allure Admin</span>
                        <button
                            type="button"
                            onClick={onClose}
                            className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg text-dark/40 hover:bg-secondary/10 hover:text-dark md:hidden"
                            aria-label="Close sidebar"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1">
                        {adminLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={onClose}
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
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                        >
                            <LogOut className="h-5 w-5" />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
