"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Eye, Filter } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Order } from "@/types";
import { adminOrderService } from "@/services/adminOrderService";
import { useAdminAuth } from "@/store/useAdminAuth";

export default function AdminOrdersPage() {
    const token = useAdminAuth((s) => s.token);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");

    useEffect(() => {
        const loadOrders = async () => {
            if (!token) {
                setOrders([]);
                setLoading(false);
                return;
            }

            try {
                const result = await adminOrderService.getOrders(token);
                setOrders(result);
            } catch {
                setOrders([]);
            } finally {
                setLoading(false);
            }
        };

        void loadOrders();
    }, [token]);

    const filteredOrders = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        if (!normalizedQuery) {
            return orders;
        }

        return orders.filter((order) =>
            order.orderNumber.toLowerCase().includes(normalizedQuery) ||
            order.customerName.toLowerCase().includes(normalizedQuery)
        );
    }, [orders, query]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "New": return "bg-blue-100 text-blue-700";
            case "Confirmed": return "bg-yellow-100 text-yellow-700";
            case "Shipped": return "bg-purple-100 text-purple-700";
            case "Delivered": return "bg-green-100 text-green-700";
            case "Cancelled": return "bg-red-100 text-red-700";
            default: return "bg-secondary/20 text-dark";
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-display text-3xl font-bold text-dark">Orders</h1>
                <p className="text-dark/60">Track and manage customer orders and payments.</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between bg-white p-4 rounded-3xl shadow-sm border border-secondary/10">
                <div className="flex flex-1 gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark/40" />
                        <input
                            type="text"
                            placeholder="Search by ID or customer..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full rounded-xl border border-secondary/10 bg-secondary/5 py-2 pl-10 pr-4 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                        />
                    </div>
                    <Button variant="outline" className="rounded-xl gap-2 text-dark/60 border-secondary/20">
                        <Filter className="h-4 w-4" /> Filters
                    </Button>
                </div>
                <div className="flex gap-2">
                    {["All", "New", "Pending Payment", "Delivered"].map(f => (
                        <button key={f} className="px-4 py-1.5 text-xs font-bold rounded-full bg-secondary/5 text-dark/40 hover:text-dark transition-colors">
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="overflow-hidden rounded-3xl bg-white shadow-sm border border-secondary/10">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-secondary/5 border-b border-secondary/10">
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-dark/40">Order ID</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-dark/40">Customer</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-dark/40">Date</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-dark/40">Total</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-dark/40">Status</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-dark/40">Payment</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-dark/40 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary/10">
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-sm text-dark/40">Loading orders...</td>
                            </tr>
                        ) : filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-sm text-dark/40">No orders found.</td>
                            </tr>
                        ) : filteredOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-secondary/5 transition-colors group">
                                <td className="px-6 py-4 font-bold text-dark text-sm">{order.orderNumber}</td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-dark text-sm">{order.customerName}</span>
                                        <span className="text-xs text-dark/40">{order.phone}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-dark/60">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 font-bold text-accent text-sm">
                                    {order.total.toLocaleString()} ETB
                                </td>
                                <td className="px-6 py-4">
                                    <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-full", getStatusColor(order.status))}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge variant={order.paymentStatus === "Paid" ? "secondary" : "outline"} className="text-[10px]">
                                        {order.paymentStatus}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Link href={`/admin/orders/${order.id}`}>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-dark/40 hover:text-accent">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
