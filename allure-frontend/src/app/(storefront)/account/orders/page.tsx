"use client";

import { Package, Clock, CheckCircle2, Truck, XCircle } from "lucide-react";

// Mock order data for display
const MOCK_ORDERS = [
    {
        id: "ORD-1001",
        date: "Feb 15, 2026",
        total: 4500,
        items: 2,
        status: "Delivered",
    },
    {
        id: "ORD-1002",
        date: "Feb 10, 2026",
        total: 3800,
        items: 1,
        status: "Shipped",
    },
    {
        id: "ORD-1003",
        date: "Feb 5, 2026",
        total: 1200,
        items: 1,
        status: "Confirmed",
    },
];

const statusConfig: Record<string, { icon: typeof Clock; color: string; bg: string }> = {
    Pending: { icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
    Confirmed: { icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-50" },
    Shipped: { icon: Truck, color: "text-purple-600", bg: "bg-purple-50" },
    Delivered: { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
    Cancelled: { icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
};

export default function OrdersPage() {
    return (
        <div className="animate-slide-up-fade">
            <div className="mb-8">
                <h1 className="font-display text-2xl font-bold text-dark tracking-tight md:text-3xl">My Orders</h1>
                <p className="text-sm text-dark/50 mt-1">Track and manage your orders.</p>
            </div>

            {MOCK_ORDERS.length === 0 ? (
                <div className="rounded-[2rem] bg-white p-12 border border-secondary/10 shadow-sm text-center">
                    <div className="h-16 w-16 rounded-full bg-secondary/5 flex items-center justify-center mx-auto mb-4">
                        <Package className="h-7 w-7 text-dark/20" />
                    </div>
                    <h3 className="font-display text-lg font-bold text-dark/40 mb-1">No orders yet</h3>
                    <p className="text-sm text-dark/30">When you place an order, it will appear here.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {MOCK_ORDERS.map((order) => {
                        const config = statusConfig[order.status] || statusConfig.Pending;
                        const StatusIcon = config.icon;
                        return (
                            <div
                                key={order.id}
                                className="group rounded-2xl bg-white p-5 md:p-6 border border-secondary/10 shadow-sm hover:shadow-md transition-all duration-300"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-accent/5 flex items-center justify-center flex-shrink-0">
                                            <Package className="h-5 w-5 text-accent/40" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="text-sm font-bold text-dark">{order.id}</p>
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${config.color} ${config.bg}`}>
                                                    <StatusIcon className="h-3 w-3" />
                                                    {order.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-dark/40 mt-0.5">{order.date} · {order.items} item{order.items > 1 ? "s" : ""}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 sm:text-right">
                                        <div>
                                            <p className="font-display text-lg font-bold text-accent">{order.total.toLocaleString()} ETB</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
