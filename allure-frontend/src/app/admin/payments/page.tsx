"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { adminOrderService } from "@/services/adminOrderService";
import { useAdminAuth } from "@/store/useAdminAuth";
import { Order } from "@/types";

export default function AdminPaymentsPage() {
    const token = useAdminAuth((state) => state.token);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const data = await adminOrderService.getOrders(token);
                setOrders(data);
            } catch {
                setOrders([]);
            } finally {
                setLoading(false);
            }
        };

        void load();
    }, [token]);

    const pendingOrders = useMemo(
        () => orders.filter((order) => order.paymentStatus === "Pending"),
        [orders]
    );

    const updatePaymentStatus = async (id: string, paymentStatus: Order["paymentStatus"]) => {
        if (!token) return;

        try {
            const updated = await adminOrderService.updateOrderStatus(token, id, { paymentStatus });
            setOrders((current) => current.map((order) => (order.id === id ? updated : order)));
        } catch {
            return;
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-display text-3xl font-bold text-dark">Payments</h1>
                <p className="text-dark/60">Manually verify payment status for placed orders.</p>
            </div>

            <div className="rounded-3xl border border-secondary/10 bg-white p-5 shadow-sm text-sm text-dark/60">
                Pending verification: <span className="font-bold text-dark">{pendingOrders.length}</span>
            </div>

            <div className="overflow-hidden rounded-3xl border border-secondary/10 bg-white shadow-sm">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="border-b border-secondary/10 bg-secondary/5">
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-dark/40">Order</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-dark/40">Customer</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-dark/40">Total</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-dark/40">Payment</th>
                            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-widest text-dark/40">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary/10">
                        {loading ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-dark/40">Loading payments...</td></tr>
                        ) : orders.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-dark/40">No orders found.</td></tr>
                        ) : orders.map((order) => (
                            <tr key={order.id} className="hover:bg-secondary/5">
                                <td className="px-6 py-4 text-sm font-bold text-dark">{order.orderNumber}</td>
                                <td className="px-6 py-4 text-sm text-dark/60">{order.customerName}</td>
                                <td className="px-6 py-4 text-sm font-bold text-accent">{order.total.toLocaleString()} ETB</td>
                                <td className="px-6 py-4 text-sm">
                                    <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${order.paymentStatus === "Paid" ? "bg-green-100 text-green-700" : order.paymentStatus === "Refunded" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                                        {order.paymentStatus}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="rounded-xl"
                                            onClick={() => void updatePaymentStatus(order.id, "Paid")}
                                            disabled={order.paymentStatus === "Paid"}
                                        >
                                            Mark Paid
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="rounded-xl"
                                            onClick={() => void updatePaymentStatus(order.id, "Refunded")}
                                            disabled={order.paymentStatus === "Refunded"}
                                        >
                                            Mark Refunded
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
