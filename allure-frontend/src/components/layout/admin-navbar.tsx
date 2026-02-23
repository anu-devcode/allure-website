"use client";

import Link from "next/link";
import { Menu, User, LogOut } from "lucide-react";
import { useAdminAuth } from "@/store/useAdminAuth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function AdminNavbar({ onMenuClick }: { onMenuClick?: () => void }) {
    const { admin, logout } = useAdminAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push("/admin/login");
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-secondary/20 bg-white">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo & Brand */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={onMenuClick}
                    >
                        <Menu className="h-6 w-6" />
                    </Button>
                    <Link href="/admin/dashboard" className="flex items-center gap-2">
                        <span className="font-display text-2xl font-bold tracking-tight text-accent">
                            Allure
                        </span>
                        <div className="h-6 w-[1px] bg-secondary/20" />
                        <span className="text-sm font-bold uppercase tracking-widest text-dark/40">
                            Admin
                        </span>
                    </Link>
                </div>

                {/* Minimal Navigation */}
                <div className="hidden items-center gap-6 md:flex">
                    <span className="text-sm font-medium text-dark/40 italic">Global Administration Panel</span>
                </div>

                {/* User Info & Logout */}
                <div className="flex items-center gap-4">
                    <div className="hidden items-center gap-2 md:flex">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/5 text-dark/40">
                            <User className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-bold text-dark">{admin?.name || admin?.email}</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleLogout}
                        className="text-dark/40 hover:text-red-500 hover:bg-red-50"
                    >
                        <LogOut className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </nav>
    );
}
