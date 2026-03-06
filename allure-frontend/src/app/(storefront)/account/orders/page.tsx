"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Clock, CheckCircle2, Truck, XCircle, Star } from "lucide-react";
import { orderService } from "@/services/orderService";
import { Order } from "@/types";
import { useCustomerAuth } from "@/store/useCustomerAuth";
import { reviewService } from "@/services/reviewService";
import { Button } from "@/components/ui/button";

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
    const [activeReviewKey, setActiveReviewKey] = useState<string | null>(null);
    const [reviewDrafts, setReviewDrafts] = useState<Record<string, { rating: number; comment: string }>>({});
    const [reviewSavingKey, setReviewSavingKey] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<string | null>(null);

    const getReviewKey = (orderId: string, productId: string) => `${orderId}:${productId}`;

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

    const handleReviewSubmit = async (orderId: string, productId: string) => {
        if (!token) {
            return;
        }

        const key = getReviewKey(orderId, productId);
        const draft = reviewDrafts[key];

        if (!draft?.comment?.trim()) {
            setFeedback("Please write a review comment before submitting.");
            return;
        }

        try {
            setReviewSavingKey(key);
            setFeedback(null);
            await reviewService.submitReview(token, {
                orderId,
                productId,
                rating: draft.rating,
                comment: draft.comment.trim(),
            });

            const result = await orderService.getMyOrders(token);
            setOrders(result);
            setActiveReviewKey(null);
            setReviewDrafts((current) => {
                const next = { ...current };
                delete next[key];
                return next;
            });
            setFeedback("Review submitted successfully and is waiting for approval.");
        } catch {
            setFeedback("Could not submit your review right now.");
        } finally {
            setReviewSavingKey(null);
        }
    };

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

            {feedback && (
                <div className={`mb-6 rounded-2xl px-4 py-3 text-sm font-medium ${feedback.toLowerCase().includes("success") ? "border border-emerald-100 bg-emerald-50 text-emerald-700" : "border border-red-100 bg-red-50 text-red-600"}`}>
                    {feedback}
                </div>
            )}

            {orders.length === 0 ? (
                <div className="rounded-[2rem] bg-white p-12 border border-secondary/10 shadow-sm text-center">
                    <div className="h-16 w-16 rounded-full bg-secondary/5 flex items-center justify-center mx-auto mb-4">
                        <Package className="h-7 w-7 text-dark/20" />
                    </div>
                    <h3 className="font-display text-lg font-bold text-dark/40 mb-1">No orders yet</h3>
                    <p className="text-sm text-dark/30">When you place an order, it will appear here.</p>
                    <Link href="/track-order" className="mt-4 inline-flex text-sm font-bold text-accent hover:underline">
                        Need to look up a guest order?
                    </Link>
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

                                {order.status === "Delivered" && (
                                    <div className="mt-5 border-t border-secondary/10 pt-5">
                                        <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-dark/35">Review delivered items</p>
                                        <div className="flex flex-col gap-3">
                                            {order.items.map((item) => {
                                                const key = getReviewKey(order.id, item.productId);
                                                const draft = reviewDrafts[key] ?? { rating: 5, comment: "" };
                                                const isOpen = activeReviewKey === key;

                                                return (
                                                    <div key={item.id} className="rounded-2xl border border-secondary/10 p-4">
                                                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                                            <div>
                                                                <p className="text-sm font-bold text-dark">{item.name}</p>
                                                                <p className="text-xs text-dark/40">Qty {item.quantity}</p>
                                                                {item.reviewId ? (
                                                                    <p className="mt-1 text-xs text-emerald-600">
                                                                        Review submitted{item.reviewApproved ? " and approved." : ", waiting for approval."}
                                                                    </p>
                                                                ) : item.canReview ? (
                                                                    <p className="mt-1 text-xs text-dark/45">You can review this delivered item.</p>
                                                                ) : null}
                                                            </div>
                                                            {!item.reviewId && item.canReview && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="rounded-xl"
                                                                    onClick={() => setActiveReviewKey((current) => current === key ? null : key)}
                                                                >
                                                                    {isOpen ? "Close" : "Write Review"}
                                                                </Button>
                                                            )}
                                                        </div>

                                                        {isOpen && !item.reviewId && item.canReview && (
                                                            <div className="mt-4 rounded-2xl bg-secondary/5 p-4">
                                                                <div className="mb-3 flex items-center gap-2">
                                                                    {[1, 2, 3, 4, 5].map((rating) => (
                                                                        <button
                                                                            key={rating}
                                                                            type="button"
                                                                            onClick={() => setReviewDrafts((current) => ({ ...current, [key]: { ...draft, rating } }))}
                                                                            className="rounded-full p-1"
                                                                        >
                                                                            <Star className={`h-5 w-5 ${rating <= draft.rating ? "fill-yellow-400 text-yellow-400" : "text-secondary/20"}`} />
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                                <textarea
                                                                    value={draft.comment}
                                                                    onChange={(event) => setReviewDrafts((current) => ({ ...current, [key]: { ...draft, comment: event.target.value } }))}
                                                                    placeholder="Tell others about your experience"
                                                                    className="min-h-[110px] w-full rounded-2xl border border-secondary/20 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/20"
                                                                />
                                                                <div className="mt-3 flex justify-end">
                                                                    <Button
                                                                        className="rounded-xl"
                                                                        onClick={() => void handleReviewSubmit(order.id, item.productId)}
                                                                        disabled={reviewSavingKey === key}
                                                                    >
                                                                        {reviewSavingKey === key ? "Submitting..." : "Submit Review"}
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
