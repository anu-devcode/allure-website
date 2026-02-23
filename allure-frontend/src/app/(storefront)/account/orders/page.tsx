"use client";

import { useEffect, useState } from "react";
import { Package, Clock, CheckCircle2, Truck, XCircle } from "lucide-react";
import { orderService } from "@/services/orderService";
import { Order } from "@/types";
import { useCustomerAuth } from "@/store/useCustomerAuth";

const statusConfig: Record<string, { icon: typeof Clock; color: string; bg: string }> = {
    Pending: { icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
    Confirmed: { icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-50" },
    Shipped: { icon: Truck, color: "text-purple-600", bg: "bg-purple-50" },
    Delivered: { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
    Cancelled: { icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
};

export default function OrdersPage() {
    const token = useCustomerAuth((s) => s.token);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadOrders = async () => {
            if (!token) {
                setOrders([]);
                setLoading(false);
                return;
            }

            try {
                const result = await orderService.getMyOrders(token);
                setOrders(result);
            } catch {
                setOrders([]);
            } finally {
                setLoading(false);
            }
        };

        void loadOrders();
    }, [token]);

    if (loading) {
        return (
            <div className="animate-slide-up-fade">
                <div className="mb-8">
                    <h1 className="font-display text-2xl font-bold text-dark tracking-tight md:text-3xl">My Orders</h1>
                    <p className="text-sm text-dark/50 mt-1">Loading your orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-slide-up-fade">
            <div className="mb-8">
                <h1 className="font-display text-2xl font-bold text-dark tracking-tight md:text-3xl">My Orders</h1>
                <p className="text-sm text-dark/50 mt-1">Track and manage your orders.</p>
            </div>

            {orders.length === 0 ? (
                <div className="rounded-[2rem] bg-white p-12 border border-secondary/10 shadow-sm text-center">
                    <div className="h-16 w-16 rounded-full bg-secondary/5 flex items-center justify-center mx-auto mb-4">
                        <Package className="h-7 w-7 text-dark/20" />
                    </div>
                    <h3 className="font-display text-lg font-bold text-dark/40 mb-1">No orders yet</h3>
                    <p className="text-sm text-dark/30">When you place an order, it will appear here.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {orders.map((order) => {
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
                                                <p className="text-sm font-bold text-dark">{order.orderNumber}</p>
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${config.color} ${config.bg}`}>
                                                    <StatusIcon className="h-3 w-3" />
                                                    {order.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-dark/40 mt-0.5">{new Date(order.createdAt).toLocaleDateString()} · {order.items.length} item{order.items.length > 1 ? "s" : ""}</p>
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
