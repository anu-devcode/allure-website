"use client";

import { use, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Phone, MapPin, Package, CheckCircle2, XCircle, Truck, Clock, Wallet, RotateCcw, UserRound, Printer, ReceiptText, Upload, ExternalLink, Trash2 } from "lucide-react";
import Link from "next/link";
import { Order } from "@/types";
import { useAdminAuth } from "@/store/useAdminAuth";
import { adminOrderService } from "@/services/adminOrderService";
import { cn } from "@/lib/utils";

interface OrderDetailPageProps {
    params: Promise<{ id: string }>;
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
    const { id } = use(params);
    const token = useAdminAuth((s) => s.token);
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
    const [nextStatus, setNextStatus] = useState<Order["status"]>("Confirmed");
    const [nextPaymentStatus, setNextPaymentStatus] = useState<Order["paymentStatus"]>("Pending");
    const [pageError, setPageError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [paymentReference, setPaymentReference] = useState("");
    const [paymentProof, setPaymentProof] = useState("");
    const [paymentMetaSaving, setPaymentMetaSaving] = useState(false);

    useEffect(() => {
        const loadOrder = async () => {
            if (!token) {
                setOrder(null);
                setLoading(false);
                return;
            }

            try {
                const result = await adminOrderService.getOrderById(token, id);
                setOrder(result);
                setNextStatus(result.status === "New" ? "Confirmed" : result.status === "Confirmed" ? "Shipped" : result.status === "Shipped" ? "Delivered" : result.status);
                setNextPaymentStatus(result.paymentStatus);
                setPaymentReference(result.paymentReference ?? "");
                setPaymentProof(result.paymentProof ?? "");
            } catch {
                setOrder(null);
            } finally {
                setLoading(false);
            }
        };

        void loadOrder();
    }, [id, token]);

    const updateOrder = async (payload: {
        status?: Order["status"];
        paymentStatus?: Order["paymentStatus"];
        paymentReference?: string | null;
        paymentProof?: string | null;
    }) => {
        if (!token || !order) {
            return;
        }

        try {
            setStatusUpdateLoading(true);
            setPageError(null);
            setSuccessMessage(null);
            const updated = await adminOrderService.updateOrderStatus(token, order.id, payload);
            setOrder(updated);
            setNextStatus(updated.status === "New" ? "Confirmed" : updated.status === "Confirmed" ? "Shipped" : updated.status === "Shipped" ? "Delivered" : updated.status);
            setNextPaymentStatus(updated.paymentStatus);
            setPaymentReference(updated.paymentReference ?? "");
            setPaymentProof(updated.paymentProof ?? "");
            setSuccessMessage("Order updated successfully.");
        } catch {
            setPageError("Could not update this order right now.");
        } finally {
            setStatusUpdateLoading(false);
        }
    };

    const timelineSteps: Array<{ label: Order["status"] | "Order Placed"; active: boolean; done: boolean; description: string }> = order
        ? [
            {
                label: "Order Placed",
                active: true,
                done: true,
                description: new Date(order.createdAt).toLocaleDateString(),
            },
            {
                label: "Confirmed",
                active: ["Confirmed", "Shipped", "Delivered"].includes(order.status),
                done: ["Confirmed", "Shipped", "Delivered"].includes(order.status),
                description: order.paymentStatus === "Paid" ? "Payment verified" : "Waiting for confirmation",
            },
            {
                label: "Shipped",
                active: ["Shipped", "Delivered"].includes(order.status),
                done: ["Shipped", "Delivered"].includes(order.status),
                description: ["Shipped", "Delivered"].includes(order.status) ? "In transit to customer" : "Not shipped yet",
            },
            {
                label: "Delivered",
                active: order.status === "Delivered",
                done: order.status === "Delivered",
                description: order.status === "Delivered" ? "Order completed" : "Awaiting delivery completion",
            },
        ]
        : [];

    const paymentBadgeVariant = order?.paymentStatus === "Paid" ? "secondary" : order?.paymentStatus === "Refunded" ? "destructive" : "outline";

    const handlePaymentProofUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const result = typeof reader.result === "string" ? reader.result : "";
            setPaymentProof(result);
        };
        reader.readAsDataURL(file);
        event.target.value = "";
    };

    const savePaymentMeta = async () => {
        if (!order) {
            return;
        }

        try {
            setPaymentMetaSaving(true);
            await updateOrder({
                paymentReference: paymentReference.trim() || null,
                paymentProof: paymentProof.trim() || null,
            });
        } finally {
            setPaymentMetaSaving(false);
        }
    };

    const buildPrintableHtml = (mode: "invoice" | "slip") => {
        const itemRows = order.items.map((item) => `
            <tr>
                <td style="padding:10px;border-bottom:1px solid #e5e7eb;">${item.name}</td>
                <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
                <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right;">${item.price.toLocaleString()} ETB</td>
                <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right;">${(item.price * item.quantity).toLocaleString()} ETB</td>
            </tr>
        `).join("");

        return `
            <html>
                <head>
                    <title>${mode === "invoice" ? "Invoice" : "Order Slip"} - ${order.orderNumber}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 32px; color: #111827; }
                        .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; }
                        .brand { font-size:28px; font-weight:700; color:#14532d; }
                        .muted { color:#6b7280; font-size:12px; }
                        .chip { display:inline-block; padding:6px 10px; border-radius:999px; background:#f3f4f6; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.08em; }
                        .grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:24px; }
                        .card { border:1px solid #e5e7eb; border-radius:14px; padding:16px; }
                        table { width:100%; border-collapse:collapse; margin-top:16px; }
                        th { text-align:left; font-size:12px; color:#6b7280; text-transform:uppercase; letter-spacing:.08em; padding:10px; border-bottom:1px solid #d1d5db; }
                        .totals { margin-top:18px; margin-left:auto; width:${mode === "invoice" ? "280px" : "220px"}; }
                        .totals-row { display:flex; justify-content:space-between; padding:8px 0; }
                        .grand { font-size:20px; font-weight:700; }
                        .footer { margin-top:32px; padding-top:16px; border-top:1px solid #e5e7eb; font-size:12px; color:#6b7280; }
                        @media print { body { margin: 18px; } }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div>
                            <div class="brand">Allure</div>
                            <div class="muted">Addis Ababa, Ethiopia</div>
                            <div class="muted">Admin generated ${mode === "invoice" ? "invoice" : "order slip"}</div>
                        </div>
                        <div style="text-align:right;">
                            <div class="chip">${mode === "invoice" ? "Invoice" : "Order Slip"}</div>
                            <h2 style="margin:14px 0 6px;">${order.orderNumber}</h2>
                            <div class="muted">Created ${new Date(order.createdAt).toLocaleString()}</div>
                            <div class="muted">Status: ${order.status} • Payment: ${order.paymentStatus}</div>
                        </div>
                    </div>

                    <div class="grid">
                        <div class="card">
                            <div class="muted">Customer</div>
                            <div style="font-weight:700;margin-top:8px;">${order.customerName}</div>
                            <div style="margin-top:4px;">${order.phone}</div>
                            <div style="margin-top:4px;">${order.city}</div>
                        </div>
                        <div class="card">
                            <div class="muted">Payment</div>
                            <div style="margin-top:8px;">Reference: ${order.paymentReference ?? "—"}</div>
                            <div style="margin-top:4px;">Proof attached: ${order.paymentProof ? "Yes" : "No"}</div>
                            <div style="margin-top:4px;">Source: ${order.orderSource ?? "Guest"}</div>
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th style="text-align:center;">Qty</th>
                                <th style="text-align:right;">Unit Price</th>
                                <th style="text-align:right;">Line Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemRows}
                        </tbody>
                    </table>

                    <div class="totals">
                        <div class="totals-row"><span>Subtotal</span><span>${order.total.toLocaleString()} ETB</span></div>
                        <div class="totals-row"><span>Delivery</span><span>Free</span></div>
                        <div class="totals-row grand"><span>Total</span><span>${order.total.toLocaleString()} ETB</span></div>
                    </div>

                    <div class="footer">
                        ${mode === "invoice"
                            ? "This invoice was generated from the admin panel for fulfillment and customer support use."
                            : "Use this order slip for packaging, verification, or courier handoff."}
                    </div>
                </body>
            </html>
        `;
    };

    const printDocument = (mode: "invoice" | "slip") => {
        const printWindow = window.open("", "_blank", "noopener,noreferrer,width=900,height=800");
        if (!printWindow) {
            setPageError("Popup blocked. Please allow popups to print the order document.");
            return;
        }

        printWindow.document.open();
        printWindow.document.write(buildPrintableHtml(mode));
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };

    const paymentProofLooksLikeImage = paymentProof.startsWith("data:image") || /\.(png|jpe?g|webp|gif|svg)$/i.test(paymentProof);

    if (loading) {
        return <div className="text-sm text-dark/40">Loading order...</div>;
    }

    if (!order) {
        return <div className="text-sm text-dark/40">Order not found.</div>;
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-2">
                    <Link href="/admin/orders" className="inline-flex items-center gap-2 text-sm text-dark/60 hover:text-accent mb-2">
                        <ChevronLeft className="h-4 w-4" /> Back to Orders
                    </Link>
                    <div className="flex items-center gap-4">
                        <h1 className="font-display text-3xl font-bold text-dark">Order {order.orderNumber}</h1>
                        <Badge variant="secondary" className="px-3 py-1 font-bold">{order.status}</Badge>
                        <Badge variant={paymentBadgeVariant} className="px-3 py-1 font-bold">{order.paymentStatus}</Badge>
                    </div>
                    <p className="text-dark/60 text-sm">Placed on {new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Button
                        variant="outline"
                        className="rounded-xl gap-2"
                        onClick={() => printDocument("invoice")}
                    >
                        <ReceiptText className="h-4 w-4" /> Print Invoice
                    </Button>
                    <Button
                        variant="outline"
                        className="rounded-xl gap-2"
                        onClick={() => printDocument("slip")}
                    >
                        <Printer className="h-4 w-4" /> Print Slip
                    </Button>
                    <Button
                        variant="outline"
                        className="rounded-xl gap-2 border-red-200 text-red-500 hover:bg-red-50"
                        onClick={() => void updateOrder({ status: "Cancelled" })}
                        disabled={statusUpdateLoading}
                    >
                        <XCircle className="h-4 w-4" /> Cancel Order
                    </Button>
                    <Button
                        variant="primary"
                        className="rounded-xl gap-2 shadow-lg shadow-accent/20"
                        onClick={() => void updateOrder({ status: "Confirmed", paymentStatus: "Paid" })}
                        disabled={statusUpdateLoading}
                    >
                        <CheckCircle2 className="h-4 w-4" /> Confirm Payment
                    </Button>
                </div>
            </div>

            {(pageError || successMessage) && (
                <div className={`rounded-2xl px-4 py-3 text-sm font-medium ${pageError ? "border border-red-100 bg-red-50 text-red-600" : "border border-emerald-100 bg-emerald-50 text-emerald-700"}`}>
                    {pageError ?? successMessage}
                </div>
            )}

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
                                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-secondary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-dark/50">
                                    <UserRound className="h-3 w-3" /> {order.orderSource ?? "Guest"} order
                                </div>
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
                                        <div className="h-16 w-12 overflow-hidden rounded-xl bg-secondary/10 flex items-center justify-center text-2xl">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <span>👗</span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-dark">{item.name}</p>
                                            <p className="text-xs text-dark/40">Quantity: {item.quantity}</p>
                                            {item.variantSelection && Object.keys(item.variantSelection).length > 0 && (
                                                <p className="mt-1 text-xs text-dark/40">
                                                    {Object.entries(item.variantSelection).map(([key, value]) => `${key}: ${value}`).join(" • ")}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-dark/40">{item.price.toLocaleString()} ETB each</p>
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
                            {timelineSteps.map((step) => (
                                <div key={step.label} className={cn("flex gap-4 relative", !step.active && "opacity-40")}>
                                    <div className={cn(
                                        "h-6 w-6 rounded-full flex items-center justify-center shrink-0 z-10",
                                        step.done ? "bg-accent text-white" : "bg-secondary/20 text-dark/40"
                                    )}>
                                        {step.done ? <CheckCircle2 className="h-3 w-3" /> : step.label === "Shipped" ? <Truck className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-dark">{step.label}</p>
                                        <p className="text-xs text-dark/40">{step.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="h-px bg-secondary/10" />
                        <div className="flex flex-col gap-3">
                            <p className="text-xs font-bold text-dark/40 uppercase tracking-widest">Update Status</p>
                            <select
                                value={nextStatus}
                                onChange={(event) => setNextStatus(event.target.value as Order["status"])}
                                className="h-10 rounded-xl bg-secondary/5 border-none text-sm font-medium focus:ring-1 focus:ring-accent outline-none"
                            >
                                <option value="Confirmed">Mark as Confirmed</option>
                                <option value="Shipped">Mark as Shipped</option>
                                <option value="Delivered">Mark as Delivered</option>
                                <option value="Cancelled">Mark as Cancelled</option>
                            </select>
                            <Button
                                variant="primary"
                                className="rounded-xl h-10 text-xs shadow-md"
                                onClick={() => void updateOrder({ status: nextStatus })}
                                disabled={statusUpdateLoading}
                            >
                                {statusUpdateLoading ? "Updating..." : "Update Status"}
                            </Button>
                        </div>

                        <div className="h-px bg-secondary/10" />
                        <div className="flex flex-col gap-4">
                            <p className="text-xs font-bold text-dark/40 uppercase tracking-widest">Payment Proof & Reference</p>

                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-dark/40">Payment Reference</label>
                                <input
                                    type="text"
                                    value={paymentReference}
                                    onChange={(event) => setPaymentReference(event.target.value)}
                                    placeholder="Transaction ID, receipt code, bank ref..."
                                    className="h-10 rounded-xl border border-secondary/10 bg-secondary/5 px-3 text-sm text-dark outline-none focus:ring-1 focus:ring-accent"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-dark/40">Upload Payment Proof</label>
                                <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-secondary/20 bg-secondary/5 px-4 py-3 text-sm font-medium text-dark/60 hover:bg-secondary/10">
                                    <Upload className="h-4 w-4" /> Upload Screenshot / Receipt
                                    <input type="file" accept="image/*" className="hidden" onChange={handlePaymentProofUpload} />
                                </label>
                            </div>

                            {paymentProof && (
                                <div className="rounded-2xl border border-secondary/10 bg-secondary/5 p-4">
                                    <div className="mb-3 flex items-center justify-between gap-3">
                                        <p className="text-xs font-bold uppercase tracking-widest text-dark/40">Current Proof</p>
                                        <div className="flex gap-2">
                                            <a
                                                href={paymentProof}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[11px] font-bold text-dark/60 hover:text-accent"
                                            >
                                                <ExternalLink className="h-3.5 w-3.5" /> Open
                                            </a>
                                            <button
                                                type="button"
                                                onClick={() => setPaymentProof("")}
                                                className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[11px] font-bold text-red-500 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" /> Remove
                                            </button>
                                        </div>
                                    </div>
                                    {paymentProofLooksLikeImage ? (
                                        <img src={paymentProof} alt="Payment proof" className="max-h-64 w-full rounded-xl object-contain bg-white" />
                                    ) : (
                                        <p className="text-sm text-dark/60 break-all">Stored proof: {paymentProof}</p>
                                    )}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    variant="outline"
                                    className="rounded-xl h-10 text-xs"
                                    onClick={() => void savePaymentMeta()}
                                    disabled={paymentMetaSaving || statusUpdateLoading}
                                >
                                    <Wallet className="mr-2 h-3.5 w-3.5" /> {paymentMetaSaving ? "Saving..." : "Save Payment Data"}
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="rounded-xl h-10 text-xs"
                                    onClick={() => {
                                        setPaymentReference(order.paymentReference ?? "");
                                        setPaymentProof(order.paymentProof ?? "");
                                        setPageError(null);
                                        setSuccessMessage(null);
                                    }}
                                    disabled={paymentMetaSaving || statusUpdateLoading}
                                >
                                    <RotateCcw className="mr-2 h-3.5 w-3.5" /> Reset Payment Data
                                </Button>
                            </div>
                        </div>

                        <div className="h-px bg-secondary/10" />
                        <div className="flex flex-col gap-3">
                            <p className="text-xs font-bold text-dark/40 uppercase tracking-widest">Update Payment</p>
                            <select
                                value={nextPaymentStatus}
                                onChange={(event) => setNextPaymentStatus(event.target.value as Order["paymentStatus"])}
                                className="h-10 rounded-xl bg-secondary/5 border-none text-sm font-medium focus:ring-1 focus:ring-accent outline-none"
                            >
                                <option value="Pending">Pending</option>
                                <option value="Paid">Paid</option>
                                <option value="Refunded">Refunded</option>
                            </select>
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    variant="outline"
                                    className="rounded-xl h-10 text-xs"
                                    onClick={() => void updateOrder({ paymentStatus: nextPaymentStatus })}
                                    disabled={statusUpdateLoading}
                                >
                                    <Wallet className="mr-2 h-3.5 w-3.5" /> Save Payment
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="rounded-xl h-10 text-xs"
                                    onClick={() => {
                                        setNextStatus(order.status === "New" ? "Confirmed" : order.status === "Confirmed" ? "Shipped" : order.status === "Shipped" ? "Delivered" : order.status);
                                        setNextPaymentStatus(order.paymentStatus);
                                        setPageError(null);
                                        setSuccessMessage(null);
                                    }}
                                    disabled={statusUpdateLoading}
                                >
                                    <RotateCcw className="mr-2 h-3.5 w-3.5" /> Reset
                                </Button>
                            </div>
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
