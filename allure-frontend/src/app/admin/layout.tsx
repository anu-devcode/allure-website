"use client";

import { AdminNavbar } from "@/components/layout/admin-navbar";
import { AdminSidebar } from "@/components/admin/sidebar";
import { useState } from "react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);

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
