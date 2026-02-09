import { AdminSidebar } from "@/components/admin/sidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-secondary/5">
            <AdminSidebar />
            <main className="pl-64">
                {/* Top Header Placeholder */}
                <header className="h-16 border-b border-secondary/10 bg-white/80 backdrop-blur-sm px-8 flex items-center justify-between sticky top-0 z-30">
                    <h2 className="font-bold text-dark">Admin Dashboard</h2>
                    <div className="flex items-center gap-4">
                        <div className="h-8 w-8 rounded-full bg-secondary/20" />
                        <span className="text-sm font-medium text-dark/70">Store Owner</span>
                    </div>
                </header>
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
