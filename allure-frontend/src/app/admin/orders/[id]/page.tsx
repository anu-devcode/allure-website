"use client";

import { use, useState } from "react";
import { MOCK_ORDERS } from "@/data/mock-orders";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Phone, MapPin, Package, CheckCircle2, XCircle, Truck, Clock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cn } from "@/lib/utils";

interface OrderDetailPageProps {
    params: Promise<{ id: string }>;
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
    const { id } = use(params);
    const order = MOCK_ORDERS.find((o) => o.id === id);

    if (!order) return notFound();

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-2">
                    <Link href="/admin/orders" className="inline-flex items-center gap-2 text-sm text-dark/60 hover:text-accent mb-2">
                        <ChevronLeft className="h-4 w-4" /> Back to Orders
                    </Link>
                    <div className="flex items-center gap-4">
                        <h1 className="font-display text-3xl font-bold text-dark">Order {order.id}</h1>
                        <Badge variant="secondary" className="px-3 py-1 font-bold">{order.status}</Badge>
                    </div>
                    <p className="text-dark/60 text-sm">Placed on {new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="rounded-xl gap-2 border-red-200 text-red-500 hover:bg-red-50">
                        <XCircle className="h-4 w-4" /> Cancel Order
                    </Button>
                    <Button variant="primary" className="rounded-xl gap-2 shadow-lg shadow-accent/20">
                        <CheckCircle2 className="h-4 w-4" /> Confirm Payment
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Left: Customer & Items */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="rounded-3xl bg-white p-8 shadow-sm border border-secondary/10 flex flex-col gap-4">
                            <h3 className="font-bold text-lg text-dark flex items-center gap-2">
                                <Phone className="h-4 w-4 text-accent" /> Customer Info
                            </h3>
                            <div>
                                <p className="font-bold text-dark">{order.customerName}</p>
                                <p className="text-sm text-dark/60">{order.phone}</p>
                            </div>
                        </div>
                        <div className="rounded-3xl bg-white p-8 shadow-sm border border-secondary/10 flex flex-col gap-4">
                            <h3 className="font-bold text-lg text-dark flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-accent" /> Delivery Address
                            </h3>
                            <div>
                                <p className="font-bold text-dark">{order.city}</p>
                                <p className="text-sm text-dark/60">Addis Ababa, Ethiopia</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-3xl bg-white p-8 shadow-sm border border-secondary/10">
                        <h3 className="font-bold text-xl text-dark mb-6 flex items-center gap-2">
                            <Package className="h-5 w-5 text-accent" /> Order Items
                        </h3>
                        <div className="flex flex-col gap-6">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between py-4 border-b border-secondary/5 last:border-0">
                                    <div className="flex items-center gap-4">
                                        <div className="h-16 w-12 rounded-xl bg-secondary/10 flex items-center justify-center text-2xl">👗</div>
                                        <div>
                                            <p className="font-bold text-dark">{item.name}</p>
                                            <p className="text-xs text-dark/40">Quantity: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-accent">{(item.price * item.quantity).toLocaleString()} ETB</p>
                                    </div>
                                </div>
                            ))}
                            <div className="mt-4 flex flex-col gap-2 pt-4 border-t border-secondary/10">
                                <div className="flex justify-between text-dark/60">
                                    <span>Subtotal</span>
                                    <span>{order.total.toLocaleString()} ETB</span>
                                </div>
                                <div className="flex justify-between text-dark/60">
                                    <span>Delivery</span>
                                    <span className="text-accent font-bold">Free</span>
                                </div>
                                <div className="flex justify-between items-end mt-2">
                                    <span className="font-bold text-dark">Total</span>
                                    <span className="text-2xl font-bold text-accent">{order.total.toLocaleString()} ETB</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Timeline & Actions */}
                <div className="flex flex-col gap-6">
                    <div className="rounded-3xl bg-white p-8 shadow-sm border border-secondary/10 flex flex-col gap-6">
                        <h3 className="font-bold text-lg text-dark flex items-center gap-2">
                            <Clock className="h-4 w-4 text-accent" /> Order Status
                        </h3>
                        <div className="flex flex-col gap-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-secondary/10">
                            <div className="flex gap-4 relative">
                                <div className="h-6 w-6 rounded-full bg-accent flex items-center justify-center text-white shrink-0 z-10"><CheckCircle2 className="h-3 w-3" /></div>
                                <div>
                                    <p className="text-sm font-bold text-dark">Order Placed</p>
                                    <p className="text-xs text-dark/40">{new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex gap-4 relative opacity-40">
                                <div className="h-6 w-6 rounded-full bg-secondary/20 flex items-center justify-center text-dark/40 shrink-0 z-10"><Clock className="h-3 w-3" /></div>
                                <div>
                                    <p className="text-sm font-bold text-dark">Confirmed</p>
                                    <p className="text-xs text-dark/40">Waiting for internal action</p>
                                </div>
                            </div>
                            <div className="flex gap-4 relative opacity-40">
                                <div className="h-6 w-6 rounded-full bg-secondary/20 flex items-center justify-center text-dark/40 shrink-0 z-10"><Truck className="h-3 w-3" /></div>
                                <div>
                                    <p className="text-sm font-bold text-dark">Shipped</p>
                                    <p className="text-xs text-dark/40">Waiting for internal action</p>
                                </div>
                            </div>
                        </div>
                        <div className="h-px bg-secondary/10" />
                        <div className="flex flex-col gap-3">
                            <p className="text-xs font-bold text-dark/40 uppercase tracking-widest">Update Status</p>
                            <select className="h-10 rounded-xl bg-secondary/5 border-none text-sm font-medium focus:ring-1 focus:ring-accent outline-none">
                                <option>Mark as Confirmed</option>
                                <option>Mark as Shipped</option>
                                <option>Mark as Delivered</option>
                            </select>
                            <Button variant="primary" className="rounded-xl h-10 text-xs shadow-md">Update Status</Button>
                        </div>
                    </div>

                    <div className="rounded-3xl bg-accent/5 p-8 border border-accent/10">
                        <h4 className="font-bold text-sm text-accent mb-2 uppercase tracking-widest">Manual Confirmation</h4>
                        <p className="text-xs text-dark/60 leading-relaxed">
                            Check Telegram for the payment screenshot before confirming the order. Paid orders will be marked with a "Paid" badge in the order list.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
