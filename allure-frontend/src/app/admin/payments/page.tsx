"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { adminOrderService } from "@/services/adminOrderService";
import { useAdminAuth } from "@/store/useAdminAuth";
import { Order } from "@/types";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { CheckCircle2, Eye, RefreshCw, RotateCcw, Search, Wallet, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminPaymentsPage() {
    const token = useAdminAuth((state) => state.token);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [query, setQuery] = useState("");
    const [paymentFilter, setPaymentFilter] = useState<"All" | Order["paymentStatus"]>("Pending");
    const [actionOrderId, setActionOrderId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async (showRefreshingState = false) => {
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
            const data = await adminOrderService.getOrders(token);
            setOrders(data);
        } catch {
            setOrders([]);
            setError("Could not load payments right now.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [token]);

    useEffect(() => {
        void load();
    }, [load]);

    const pendingOrders = useMemo(
        () => orders.filter((order) => order.paymentStatus === "Pending"),
        [orders]
    );

    const filteredOrders = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        return orders.filter((order) => {
            const matchesQuery = !normalizedQuery || [order.orderNumber, order.customerName, order.phone].some((value) => value.toLowerCase().includes(normalizedQuery));
            const matchesPayment = paymentFilter === "All" || order.paymentStatus === paymentFilter;
            return matchesQuery && matchesPayment;
        });
    }, [orders, paymentFilter, query]);

    const paymentStats = useMemo(() => ({
        total: orders.length,
        pending: orders.filter((order) => order.paymentStatus === "Pending").length,
        paid: orders.filter((order) => order.paymentStatus === "Paid").length,
        refunded: orders.filter((order) => order.paymentStatus === "Refunded").length,
    }), [orders]);

    const updatePaymentStatus = async (id: string, paymentStatus: Order["paymentStatus"]) => {
        if (!token) return;

        try {
            setActionOrderId(id);
            setError(null);
            const updated = await adminOrderService.updateOrderStatus(token, id, { paymentStatus });
            setOrders((current) => current.map((order) => (order.id === id ? updated : order)));
        } catch {
            setError("Could not update payment status right now.");
        } finally {
            setActionOrderId(null);
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="font-display text-3xl font-bold text-dark">Payments</h1>
                    <p className="text-dark/60">Review manual payment confirmations, mark paid, and process refunds.</p>
                </div>
                <Button
                    variant="outline"
                    className="rounded-xl gap-2"
                    onClick={() => void load(true)}
                    disabled={loading || refreshing}
                >
                    <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
                    Refresh
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-3xl border border-secondary/10 bg-white p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-widest text-dark/40">All Orders</p>
                    <p className="mt-2 font-display text-3xl font-bold text-dark">{paymentStats.total}</p>
                </div>
                <div className="rounded-3xl border border-secondary/10 bg-white p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-widest text-dark/40">Pending</p>
                    <p className="mt-2 font-display text-3xl font-bold text-dark">{paymentStats.pending}</p>
                </div>
                <div className="rounded-3xl border border-secondary/10 bg-white p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-widest text-dark/40">Paid</p>
                    <p className="mt-2 font-display text-3xl font-bold text-dark">{paymentStats.paid}</p>
                </div>
                <div className="rounded-3xl border border-secondary/10 bg-white p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-widest text-dark/40">Refunded</p>
                    <p className="mt-2 font-display text-3xl font-bold text-dark">{paymentStats.refunded}</p>
                </div>
            </div>

            <div className="flex flex-col gap-4 rounded-3xl border border-secondary/10 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="relative w-full lg:max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark/40" />
                        <input
                            type="text"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search by order, customer, phone..."
                            className="w-full rounded-xl border border-secondary/10 bg-secondary/5 py-2.5 pl-10 pr-4 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {(["All", "Pending", "Paid", "Refunded"] as const).map((option) => (
                            <button
                                key={option}
                                type="button"
                                onClick={() => setPaymentFilter(option)}
                                className={cn(
                                    "rounded-full px-4 py-1.5 text-xs font-bold transition-colors",
                                    paymentFilter === option ? "bg-primary text-dark" : "bg-secondary/5 text-dark/50 hover:text-dark"
                                )}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="rounded-2xl border border-secondary/10 bg-secondary/5 px-4 py-3 text-sm text-dark/60">
                    Pending verification: <span className="font-bold text-dark">{pendingOrders.length}</span>
                </div>

                {error && (
                    <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                        {error}
                    </div>
                )}
            </div>

            <div className="overflow-hidden rounded-3xl border border-secondary/10 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[980px] border-collapse text-left">
                        <thead>
                            <tr className="border-b border-secondary/10 bg-secondary/5">
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-dark/40">Order</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-dark/40">Customer</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-dark/40">Total</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-dark/40">Order Status</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-dark/40">Payment</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-dark/40">Reference</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-dark/40">Proof</th>
                                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-widest text-dark/40">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary/10">
                            {loading ? (
                                <tr><td colSpan={8} className="px-6 py-8 text-center text-sm text-dark/40">Loading payments...</td></tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr><td colSpan={8} className="px-6 py-8 text-center text-sm text-dark/40">No payments match the current filters.</td></tr>
                            ) : filteredOrders.map((order) => {
                                const busy = actionOrderId === order.id;
                                return (
                                    <tr key={order.id} className="hover:bg-secondary/5">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-dark">{order.orderNumber}</span>
                                                <span className="text-xs text-dark/40">{new Date(order.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-dark">{order.customerName}</span>
                                                <span className="text-xs text-dark/40">{order.phone}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-accent">{order.total.toLocaleString()} ETB</td>
                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className="text-[10px]">{order.status}</Badge>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${order.paymentStatus === "Paid" ? "bg-green-100 text-green-700" : order.paymentStatus === "Refunded" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                                                {order.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-dark/60 max-w-[180px]">
                                            <span className="block truncate">{order.paymentReference || "—"}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {order.paymentProof ? (
                                                <a
                                                    href={order.paymentProof}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-3 py-1 text-[11px] font-bold text-dark/60 hover:text-accent"
                                                >
                                                    <ExternalLink className="h-3.5 w-3.5" /> View proof
                                                </a>
                                            ) : (
                                                <span className="text-xs text-dark/35">No proof</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="rounded-xl"
                                                    onClick={() => void updatePaymentStatus(order.id, "Pending")}
                                                    disabled={busy || order.paymentStatus === "Pending"}
                                                >
                                                    <RotateCcw className="mr-1 h-3.5 w-3.5" /> Pending
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="rounded-xl"
                                                    onClick={() => void updatePaymentStatus(order.id, "Paid")}
                                                    disabled={busy || order.paymentStatus === "Paid"}
                                                >
                                                    <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Paid
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="rounded-xl"
                                                    onClick={() => void updatePaymentStatus(order.id, "Refunded")}
                                                    disabled={busy || order.paymentStatus === "Refunded"}
                                                >
                                                    <Wallet className="mr-1 h-3.5 w-3.5" /> Refunded
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
