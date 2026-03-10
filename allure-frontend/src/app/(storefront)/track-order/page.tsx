"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { orderService } from "@/services/orderService";
import { useCustomerAuth } from "@/store/useCustomerAuth";
import { Order } from "@/types";
import { ArrowRight, CheckCircle2, Clock, Search, Truck, UserRoundSearch, X, XCircle } from "lucide-react";
import { usePersistentDraft } from "@/hooks/usePersistentDraft";
import { AutosaveIndicator } from "@/components/ui/autosave-indicator";

const statusConfig: Record<string, { icon: typeof Clock; color: string; bg: string }> = {
    New: { icon: Clock, color: "text-yellow-700", bg: "bg-yellow-50" },
    Confirmed: { icon: CheckCircle2, color: "text-blue-700", bg: "bg-blue-50" },
    Shipped: { icon: Truck, color: "text-purple-700", bg: "bg-purple-50" },
    Delivered: { icon: CheckCircle2, color: "text-green-700", bg: "bg-green-50" },
    Cancelled: { icon: XCircle, color: "text-red-700", bg: "bg-red-50" },
};

export default function TrackOrderPage() {
    const searchParams = useSearchParams();
    const isAuthenticated = useCustomerAuth((state) => state.isAuthenticated);
    const [orderNumber, setOrderNumber] = useState(searchParams.get("orderNumber") ?? "");
    const [phone, setPhone] = useState(searchParams.get("phone") ?? "");
    const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [autoLoaded, setAutoLoaded] = useState(false);
    const [savedRefs, setSavedRefs] = useState(orderService.getTrackedGuestOrders());

    const handleRestore = useCallback((draft: { orderNumber: string; phone: string }) => {
        setOrderNumber(draft.orderNumber ?? "");
        setPhone(draft.phone ?? "");
    }, []);

    const { saveState, restored } = usePersistentDraft({
        storageKey: "allure-track-order-draft-v1",
        value: { orderNumber, phone },
        onRestore: handleRestore,
    });

    const savedRefsSorted = useMemo(
        () => [...savedRefs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        [savedRefs]
    );

    const lookupOrder = useCallback(async (nextOrderNumber = orderNumber, nextPhone = phone) => {
        setLoading(true);
        setError(null);

        try {
            const order = await orderService.trackOrder({
                orderNumber: nextOrderNumber.trim().toUpperCase(),
                phone: nextPhone.trim(),
            });
            setTrackedOrder(order);
            setSavedRefs(orderService.getTrackedGuestOrders());
        } catch {
            setTrackedOrder(null);
            setError("We couldn't find an order with that number and phone combination.");
        } finally {
            setLoading(false);
        }
    }, [orderNumber, phone]);

    useEffect(() => {
        if (autoLoaded || !orderNumber.trim() || !phone.trim()) {
            return;
        }

        setAutoLoaded(true);
        void lookupOrder(orderNumber, phone);
    }, [autoLoaded, lookupOrder, orderNumber, phone]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        await lookupOrder();
    };

    return (
        <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="mx-auto flex max-w-5xl flex-col gap-8">
                <div className="rounded-[2.5rem] bg-cream p-8 md:p-10 border border-secondary/10">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="max-w-2xl">
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-accent">
                                <UserRoundSearch className="h-3.5 w-3.5" />
                                Guest Order Tracking
                            </div>
                            <h1 className="font-display text-3xl font-bold tracking-tight text-dark md:text-5xl md:leading-[1.06]">Track your order anytime</h1>
                            <p className="mt-3 max-w-xl text-sm leading-relaxed text-dark/60 md:text-base">
                                Enter your order number and the phone number used at checkout. If you later sign in or create an account with the same phone number, your guest orders sync into your account automatically.
                            </p>
                        </div>
                        {isAuthenticated && (
                            <Link href="/account/orders">
                                <Button variant="secondary" className="rounded-2xl px-6 py-6 font-bold">
                                    View My Orders <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
                    <div className="rounded-[2rem] border border-secondary/10 bg-white p-6 md:p-8 shadow-sm">
                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                            <AutosaveIndicator saveState={saveState} restored={restored} />
                            <div>
                                <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-dark/40">Order Number</label>
                                <input
                                    required
                                    value={orderNumber}
                                    onChange={(event) => setOrderNumber(event.target.value.toUpperCase())}
                                    placeholder="ORD-1001"
                                    className="h-14 w-full rounded-2xl border-2 border-secondary/10 px-5 text-sm text-dark outline-none transition focus:border-accent"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-dark/40">Phone Number</label>
                                <input
                                    required
                                    value={phone}
                                    onChange={(event) => setPhone(event.target.value)}
                                    placeholder="0911 223 344"
                                    className="h-14 w-full rounded-2xl border-2 border-secondary/10 px-5 text-sm text-dark outline-none transition focus:border-accent"
                                />
                            </div>

                            {error && (
                                <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                                    {error}
                                </div>
                            )}

                            <Button type="submit" variant="primary" size="lg" className="h-14 rounded-2xl gap-3 font-bold" disabled={loading}>
                                {loading ? "Looking up order..." : <>Track Order <Search className="h-4 w-4" /></>}
                            </Button>
                        </form>

                        {trackedOrder && (
                            <div className="mt-8 rounded-[2rem] border border-secondary/10 bg-secondary/5 p-5 md:p-6">
                                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-[0.2em] text-dark/35">Order found</p>
                                        <h2 className="mt-1 font-display text-2xl font-bold text-dark">{trackedOrder.orderNumber}</h2>
                                        <p className="text-sm text-dark/45">Placed on {new Date(trackedOrder.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    {(() => {
                                        const config = statusConfig[trackedOrder.status] ?? statusConfig.New;
                                        const StatusIcon = config.icon;
                                        return (
                                            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] shadow-sm transition-transform duration-300 hover:-translate-y-0.5 ${config.color} ${config.bg}`}>
                                                <StatusIcon className="h-3.5 w-3.5" />
                                                {trackedOrder.status}
                                            </span>
                                        );
                                    })()}
                                </div>

                                <div className="grid gap-4 sm:grid-cols-3">
                                    <div className="rounded-2xl bg-white p-4 border border-secondary/10">
                                        <p className="text-xs font-black uppercase tracking-[0.2em] text-dark/30">Customer</p>
                                        <p className="mt-1 text-sm font-bold text-dark">{trackedOrder.customerName}</p>
                                    </div>
                                    <div className="rounded-2xl bg-white p-4 border border-secondary/10">
                                        <p className="text-xs font-black uppercase tracking-[0.2em] text-dark/30">Delivery City</p>
                                        <p className="mt-1 text-sm font-bold text-dark">{trackedOrder.city}</p>
                                    </div>
                                    <div className="rounded-2xl bg-white p-4 border border-secondary/10">
                                        <p className="text-xs font-black uppercase tracking-[0.2em] text-dark/30">Total</p>
                                        <p className="mt-1 text-sm font-bold text-accent">{trackedOrder.total.toLocaleString()} ETB</p>
                                    </div>
                                </div>

                                <div className="mt-5 rounded-2xl bg-white p-4 border border-secondary/10">
                                    <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-dark/30">Items</p>
                                    <div className="flex flex-col gap-3">
                                        {trackedOrder.items.map((item) => (
                                            <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-secondary/10 px-4 py-3">
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-bold text-dark">{item.name}</p>
                                                    <p className="text-xs text-dark/45">Qty {item.quantity}</p>
                                                </div>
                                                <p className="text-sm font-bold text-dark">{(item.price * item.quantity).toLocaleString()} ETB</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-6">
                        <div className="rounded-[2rem] border border-secondary/10 bg-white p-6 shadow-sm">
                            <h2 className="font-display text-xl font-bold tracking-tight text-dark">Saved recent guest orders</h2>
                            <p className="mt-1 text-sm leading-relaxed text-dark/50">Recent orders tracked from this device appear here for faster lookup.</p>

                            {savedRefsSorted.length === 0 ? (
                                <div className="mt-5 rounded-2xl bg-secondary/5 p-5 text-sm text-dark/45">
                                    No guest orders saved on this device yet.
                                </div>
                            ) : (
                                <div className="mt-5 flex flex-col gap-3">
                                    {savedRefsSorted.map((entry) => (
                                        <div key={entry.orderNumber} className="rounded-2xl border border-secondary/10 p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setOrderNumber(entry.orderNumber);
                                                        setPhone(entry.phone);
                                                        void lookupOrder(entry.orderNumber, entry.phone);
                                                    }}
                                                    className="min-w-0 text-left"
                                                >
                                                    <p className="text-sm font-bold text-dark">{entry.orderNumber}</p>
                                                    <p className="text-xs text-dark/45">{entry.phone}</p>
                                                    <p className="mt-1 text-[11px] text-dark/30">Saved {new Date(entry.createdAt).toLocaleDateString()}</p>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        orderService.removeTrackedGuestOrder(entry.orderNumber);
                                                        setSavedRefs(orderService.getTrackedGuestOrders());
                                                    }}
                                                    className="rounded-full p-1 text-dark/25 transition hover:bg-secondary/10 hover:text-dark/60"
                                                    aria-label={`Remove ${entry.orderNumber}`}
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="rounded-[2rem] border border-primary/15 bg-primary/5 p-6 shadow-sm">
                            <h2 className="font-display text-xl font-bold tracking-tight text-dark">Want these in your account?</h2>
                            <p className="mt-2 text-sm leading-relaxed text-dark/60">
                                Create an account or sign in using the same phone number you used at checkout. Matching guest orders are attached to your customer account automatically.
                            </p>
                            <div className="mt-5">
                                <Link href="/auth">
                                    <Button variant="primary" className="h-12 rounded-2xl px-6 font-bold">
                                        Sign in or create account <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <div className="rounded-[2rem] border border-secondary/10 bg-white p-6 shadow-sm">
                            <h2 className="font-display text-xl font-bold tracking-tight text-dark">After payment</h2>
                            <p className="mt-2 text-sm leading-relaxed text-dark/60">
                                After you transfer the payment, send your screenshot to the support number shown at checkout so the team can confirm and process the order faster.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}