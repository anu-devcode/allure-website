"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Eye, RefreshCw, CheckCircle2, Truck, Wallet } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Order } from "@/types";
import { adminOrderService } from "@/services/adminOrderService";
import { useAdminAuth } from "@/store/useAdminAuth";

const statusOptions: Array<Order["status"] | "All"> = ["All", "New", "Confirmed", "Shipped", "Delivered", "Cancelled"];
const paymentOptions: Array<Order["paymentStatus"] | "All"> = ["All", "Pending", "Paid", "Refunded"];
const sourceOptions: Array<NonNullable<Order["orderSource"]> | "All"> = ["All", "Guest", "Account"];

export default function AdminOrdersPage() {
    const token = useAdminAuth((s) => s.token);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<(typeof statusOptions)[number]>("All");
    const [paymentFilter, setPaymentFilter] = useState<(typeof paymentOptions)[number]>("All");
    const [sourceFilter, setSourceFilter] = useState<(typeof sourceOptions)[number]>("All");
    const [error, setError] = useState<string | null>(null);
    const [actionOrderId, setActionOrderId] = useState<string | null>(null);

    const loadOrders = useCallback(async (showRefreshingState = false) => {
        if (!token) {
            setOrders([]);
            setLoading(false);
            setRefreshing(false);
            return;
        }

        if (showRefreshingState) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            setError(null);
            const result = await adminOrderService.getOrders(token);
            setOrders(result);
        } catch {
            setOrders([]);
            setError("Could not load orders right now.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [token]);

    useEffect(() => {
        void loadOrders();
    }, [loadOrders]);

    const filteredOrders = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        return orders.filter((order) => {
            const matchesQuery = !normalizedQuery || [
                order.orderNumber,
                order.customerName,
                order.phone,
                order.city,
                order.orderSource ?? "Guest",
            ].some((value) => value.toLowerCase().includes(normalizedQuery));

            const matchesStatus = statusFilter === "All" || order.status === statusFilter;
            const matchesPayment = paymentFilter === "All" || order.paymentStatus === paymentFilter;
            const matchesSource = sourceFilter === "All" || (order.orderSource ?? "Guest") === sourceFilter;

            return matchesQuery && matchesStatus && matchesPayment && matchesSource;
        });
    }, [orders, paymentFilter, query, sourceFilter, statusFilter]);

    const stats = useMemo(() => ({
        total: orders.length,
        pendingPayment: orders.filter((order) => order.paymentStatus === "Pending").length,
        activeFulfillment: orders.filter((order) => ["New", "Confirmed", "Shipped"].includes(order.status)).length,
        delivered: orders.filter((order) => order.status === "Delivered").length,
    }), [orders]);

    const getStatusColor = (status: Order["status"]) => {
        switch (status) {
            case "New": return "bg-blue-100 text-blue-700";
            case "Confirmed": return "bg-yellow-100 text-yellow-700";
            case "Shipped": return "bg-purple-100 text-purple-700";
            case "Delivered": return "bg-green-100 text-green-700";
            case "Cancelled": return "bg-red-100 text-red-700";
            default: return "bg-secondary/20 text-dark";
        }
    };

    const getPaymentVariant = (paymentStatus: Order["paymentStatus"]) => {
        switch (paymentStatus) {
            case "Paid":
                return "secondary" as const;
            case "Refunded":
                return "destructive" as const;
            default:
                return "outline" as const;
        }
    };

    const handleQuickUpdate = async (orderId: string, payload: { status?: Order["status"]; paymentStatus?: Order["paymentStatus"] }) => {
        if (!token) return;

        try {
            setActionOrderId(orderId);
            setError(null);
            const updated = await adminOrderService.updateOrderStatus(token, orderId, payload);
            setOrders((current) => current.map((order) => (order.id === orderId ? updated : order)));
        } catch {
            setError("Could not update that order right now.");
        } finally {
            setActionOrderId(null);
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="font-display text-3xl font-bold text-dark">Orders</h1>
                    <p className="text-dark/60">Manage order intake, fulfillment, and payment progress from one place.</p>
                </div>
                <Button
                    variant="outline"
                    className="rounded-xl gap-2"
                    onClick={() => void loadOrders(true)}
                    disabled={loading || refreshing}
                >
                    <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
                    Refresh
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-3xl border border-secondary/10 bg-white p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-widest text-dark/40">Total Orders</p>
                    <p className="mt-2 font-display text-3xl font-bold text-dark">{stats.total}</p>
                </div>
                <div className="rounded-3xl border border-secondary/10 bg-white p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-widest text-dark/40">Pending Payment</p>
                    <p className="mt-2 font-display text-3xl font-bold text-dark">{stats.pendingPayment}</p>
                </div>
                <div className="rounded-3xl border border-secondary/10 bg-white p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-widest text-dark/40">In Fulfillment</p>
                    <p className="mt-2 font-display text-3xl font-bold text-dark">{stats.activeFulfillment}</p>
                </div>
                <div className="rounded-3xl border border-secondary/10 bg-white p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-widest text-dark/40">Delivered</p>
                    <p className="mt-2 font-display text-3xl font-bold text-dark">{stats.delivered}</p>
                </div>
            </div>

            <div className="flex flex-col gap-4 rounded-3xl border border-secondary/10 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="relative w-full lg:max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark/40" />
                        <input
                            type="text"
                            placeholder="Search by order, customer, phone, city..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full rounded-xl border border-secondary/10 bg-secondary/5 py-2.5 pl-10 pr-4 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:w-auto">
                        <select
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value as (typeof statusOptions)[number])}
                            className="h-10 rounded-xl border border-secondary/10 bg-secondary/5 px-3 text-sm text-dark outline-none focus:ring-1 focus:ring-accent"
                        >
                            {statusOptions.map((option) => (
                                <option key={option} value={option}>{option === "All" ? "All statuses" : option}</option>
                            ))}
                        </select>
                        <select
                            value={paymentFilter}
                            onChange={(event) => setPaymentFilter(event.target.value as (typeof paymentOptions)[number])}
                            className="h-10 rounded-xl border border-secondary/10 bg-secondary/5 px-3 text-sm text-dark outline-none focus:ring-1 focus:ring-accent"
                        >
                            {paymentOptions.map((option) => (
                                <option key={option} value={option}>{option === "All" ? "All payments" : option}</option>
                            ))}
                        </select>
                        <select
                            value={sourceFilter}
                            onChange={(event) => setSourceFilter(event.target.value as (typeof sourceOptions)[number])}
                            className="h-10 rounded-xl border border-secondary/10 bg-secondary/5 px-3 text-sm text-dark outline-none focus:ring-1 focus:ring-accent"
                        >
                            {sourceOptions.map((option) => (
                                <option key={option} value={option}>{option === "All" ? "All sources" : option}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {["All", "New", "Confirmed", "Shipped", "Delivered"].map((filter) => (
                        <button
                            key={filter}
                            type="button"
                            onClick={() => setStatusFilter(filter as (typeof statusOptions)[number])}
                            className={cn(
                                "rounded-full px-4 py-1.5 text-xs font-bold transition-colors",
                                statusFilter === filter ? "bg-primary text-dark" : "bg-secondary/5 text-dark/50 hover:text-dark"
                            )}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                {error && (
                    <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                        {error}
                    </div>
                )}
            </div>

            <div className="overflow-hidden rounded-3xl bg-white shadow-sm border border-secondary/10">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1100px] border-collapse text-left">
                        <thead>
                            <tr className="bg-secondary/5 border-b border-secondary/10">
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-dark/40">Order</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-dark/40">Customer</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-dark/40">Source</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-dark/40">Date</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-dark/40">Total</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-dark/40">Status</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-dark/40">Payment</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-dark/40 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary/10">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-sm text-dark/40">Loading orders...</td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-sm text-dark/40">No orders match the current filters.</td>
                                </tr>
                            ) : filteredOrders.map((order) => {
                                const busy = actionOrderId === order.id;

                                return (
                                    <tr key={order.id} className="hover:bg-secondary/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-dark text-sm">{order.orderNumber}</span>
                                                <span className="text-xs text-dark/40">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-dark text-sm">{order.customerName}</span>
                                                <span className="text-xs text-dark/40">{order.phone}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
                                                order.orderSource === "Account" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                                            )}>
                                                {order.orderSource ?? "Guest"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-dark/60">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 font-bold text-accent text-sm">{order.total.toLocaleString()} ETB</td>
                                        <td className="px-6 py-4">
                                            <span className={cn("inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider", getStatusColor(order.status))}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={getPaymentVariant(order.paymentStatus)} className="text-[10px]">
                                                {order.paymentStatus}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="rounded-xl"
                                                    onClick={() => void handleQuickUpdate(order.id, { paymentStatus: "Paid" })}
                                                    disabled={busy || order.paymentStatus === "Paid"}
                                                >
                                                    <Wallet className="mr-1 h-3.5 w-3.5" /> Paid
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="rounded-xl"
                                                    onClick={() => void handleQuickUpdate(order.id, { status: order.status === "New" ? "Confirmed" : "Shipped" })}
                                                    disabled={busy || ["Delivered", "Cancelled", "Shipped"].includes(order.status)}
                                                >
                                                    {order.status === "New" ? <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> : <Truck className="mr-1 h-3.5 w-3.5" />}
                                                    {order.status === "New" ? "Confirm" : "Ship"}
                                                </Button>
                                                <Link href={`/admin/orders/${order.id}`}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-dark/40 hover:text-accent">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
