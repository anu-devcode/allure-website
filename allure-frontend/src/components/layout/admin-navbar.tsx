"use client";

import Link from "next/link";
import { Menu, User, LogOut, Moon, Sun, Monitor } from "lucide-react";
import { useAdminAuth } from "@/store/useAdminAuth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AdminGlobalSearch } from "@/components/admin/admin-global-search";

export function AdminNavbar({
    onMenuClick,
    adminTheme,
    resolvedTheme,
    onToggleTheme,
}: {
    onMenuClick?: () => void;
    adminTheme: "light" | "dark" | "system";
    resolvedTheme: "light" | "dark";
    onToggleTheme: () => void;
}) {
    const themeLabel = adminTheme === "system" ? `System (${resolvedTheme})` : adminTheme;
    const { admin, logout } = useAdminAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push("/admin/login");
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-secondary/20 bg-white">
            <div className="container mx-auto flex flex-col gap-2 px-4 py-3 md:h-16 md:flex-row md:items-center md:justify-between md:gap-0 md:py-0">
                <div className="flex w-full items-center justify-between md:w-auto md:justify-start md:gap-6">
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
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-white font-bold">
                                A
                            </div>
                            <div className="md:hidden">
                                <span className="font-display text-xl font-bold tracking-tight text-accent">Allure</span>
                                <span className="ml-2 text-xs font-bold uppercase tracking-widest text-dark/40">Admin</span>
                            </div>
                        </Link>
                    </div>

                    <div className="flex items-center gap-1 md:hidden">
                        <Link
                            href="/admin/settings"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-dark/40 hover:bg-secondary/10 hover:text-accent"
                            aria-label="Open profile"
                        >
                            <User className="h-5 w-5" />
                        </Link>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onToggleTheme}
                            className="text-dark/40 hover:text-accent hover:bg-secondary/10"
                            aria-label={`Toggle theme (${themeLabel})`}
                            title={`Theme: ${themeLabel}`}
                        >
                            {adminTheme === "system" ? (
                                <Monitor className="h-5 w-5" />
                            ) : adminTheme === "dark" ? (
                                <Sun className="h-5 w-5" />
                            ) : (
                                <Moon className="h-5 w-5" />
                            )}
                        </Button>
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

                <div className="hidden w-full max-w-xl px-6 md:flex">
                    <AdminGlobalSearch />
                </div>

                {/* User Info & Logout */}
                <div className="hidden items-center gap-4 md:flex">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/5 text-dark/40">
                            <User className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-bold text-dark">{admin?.name || admin?.email}</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onToggleTheme}
                        className="text-dark/40 hover:text-accent hover:bg-secondary/10"
                        aria-label={`Toggle theme (${themeLabel})`}
                        title={`Theme: ${themeLabel}`}
                    >
                        {adminTheme === "system" ? (
                            <Monitor className="h-5 w-5" />
                        ) : adminTheme === "dark" ? (
                            <Sun className="h-5 w-5" />
                        ) : (
                            <Moon className="h-5 w-5" />
                        )}
                    </Button>
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
            <div className="container mx-auto px-4 pb-3 md:hidden">
                <AdminGlobalSearch />
            </div>
        </nav>
    );
}
