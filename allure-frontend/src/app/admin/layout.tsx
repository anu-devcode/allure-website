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

    return (
        <div className="min-h-screen bg-secondary/5">
            <AdminSidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="flex flex-col md:pl-64">
                <AdminNavbar onMenuClick={() => setSidebarOpen(true)} />
                <main className="container mx-auto px-4 py-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
