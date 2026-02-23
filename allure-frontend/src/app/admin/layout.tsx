"use client";

import { AdminNavbar } from "@/components/layout/admin-navbar";
import { AdminSidebar } from "@/components/admin/sidebar";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAdminAuth } from "@/store/useAdminAuth";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [ready, setReady] = useState(false);
    const [adminTheme, setAdminTheme] = useState<"light" | "dark" | "system">("light");
    const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
    const pathname = usePathname();
    const router = useRouter();
    const isAuthenticated = useAdminAuth((s) => s.isAuthenticated);
    const rehydrateSession = useAdminAuth((s) => s.rehydrateSession);

    useEffect(() => {
        const checkSession = async () => {
            await rehydrateSession();
            setReady(true);
        };
        void checkSession();
    }, [rehydrateSession]);

    useEffect(() => {
        try {
            const stored = localStorage.getItem("allure-admin-theme");
            if (stored === "dark" || stored === "light" || stored === "system") {
                setAdminTheme(stored);
            }
        } catch {
            return;
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem("allure-admin-theme", adminTheme);
        } catch {
            return;
        }
    }, [adminTheme]);

    useEffect(() => {
        if (adminTheme !== "system") {
            setResolvedTheme(adminTheme);
            return;
        }

        const query = window.matchMedia("(prefers-color-scheme: dark)");
        const update = () => setResolvedTheme(query.matches ? "dark" : "light");
        update();
        query.addEventListener("change", update);
        return () => query.removeEventListener("change", update);
    }, [adminTheme]);

    useEffect(() => {
        if (!ready) {
            return;
        }

        if (!isAuthenticated && pathname !== "/admin/login") {
            router.push("/admin/login");
        }
    }, [ready, isAuthenticated, pathname, router]);

    const isLoginPage = pathname === "/admin/login";

    if (!ready) {
        return null;
    }

    if (isLoginPage) {
        return <>{children}</>;
    }

    const handleToggleTheme = () => {
        setAdminTheme((current) => {
            if (current === "light") return "dark";
            if (current === "dark") return "system";
            return "light";
        });
    };

    return (
        <div className="min-h-screen bg-secondary/5 admin-theme" data-admin-theme={resolvedTheme}>
            <AdminSidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="flex flex-col md:pl-64">
                <AdminNavbar onMenuClick={() => setSidebarOpen(true)} adminTheme={adminTheme} resolvedTheme={resolvedTheme} onToggleTheme={handleToggleTheme} />
                <main className="container mx-auto px-4 py-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
