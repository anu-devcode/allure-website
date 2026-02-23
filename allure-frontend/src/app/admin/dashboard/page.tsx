"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    TrendingUp,
    Users,
    ShoppingBag,
    Clock,
    ArrowUpRight,
    ArrowDownRight,
    BarChart3,
    Wallet,
    Percent,
    Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Order } from "@/types";
import { useAdminAuth } from "@/store/useAdminAuth";
import { adminOrderService } from "@/services/adminOrderService";
import { adminProductService } from "@/services/adminProductService";
import { adminCustomerService } from "@/services/adminCustomerService";
import { CustomRequest, getCustomRequests } from "@/services/customRequestService";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
    const token = useAdminAuth((state) => state.token);
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<Order[]>([]);
    const [customerCount, setCustomerCount] = useState(0);
    const [productCount, setProductCount] = useState(0);
    const [customRequests, setCustomRequests] = useState<CustomRequest[]>([]);
    const [recentTab, setRecentTab] = useState<"orders" | "requests">("orders");

    useEffect(() => {
        const loadDashboardData = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const [ordersResult, productsResult, customersResult, customRequestsResult] = await Promise.all([
                    adminOrderService.getOrders(token),
                    adminProductService.getProducts(),
                    adminCustomerService.getCustomers(token),
                    getCustomRequests(token),
                ]);

                setOrders(ordersResult);
                setProductCount(productsResult.length);
                setCustomerCount(customersResult.length);
                setCustomRequests(customRequestsResult);
            } catch {
                setOrders([]);
                setCustomerCount(0);
                setProductCount(0);
                setCustomRequests([]);
            } finally {
                setLoading(false);
            }
        };

        void loadDashboardData();
    }, [token]);

    const totalRevenue = useMemo(
        () => orders.reduce((sum, order) => sum + order.total, 0),
        [orders]
    );

    const pendingCustomRequests = useMemo(
        () => customRequests.filter((request) => request.status === "PENDING").length,
        [customRequests]
    );

    const recentOrders = useMemo(
        () => [...orders].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 4),
        [orders]
    );

    const recentCustomRequests = useMemo(
        () => [...customRequests].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 4),
        [customRequests]
    );

    const monthlyBuckets = useMemo(() => {
        const now = new Date();
        const buckets = Array.from({ length: 6 }).map((_, index) => {
            const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
            const label = date.toLocaleString("en-US", { month: "short" });
            const key = `${date.getFullYear()}-${date.getMonth()}`;
            return { key, label, revenue: 0, orders: 0 };
        });

        orders.forEach((order) => {
            const created = new Date(order.createdAt);
            const key = `${created.getFullYear()}-${created.getMonth()}`;
            const bucket = buckets.find((item) => item.key === key);
            if (bucket) {
                bucket.revenue += order.total;
                bucket.orders += 1;
            }
        });

        return buckets;
    }, [orders]);

    const revenueSeries = useMemo(() => monthlyBuckets.map((item) => item.revenue), [monthlyBuckets]);
    const orderSeries = useMemo(() => monthlyBuckets.map((item) => item.orders), [monthlyBuckets]);
    const maxRevenue = useMemo(() => Math.max(1, ...revenueSeries), [revenueSeries]);
    const maxOrders = useMemo(() => Math.max(1, ...orderSeries), [orderSeries]);

    const averageOrderValue = useMemo(
        () => (orders.length ? totalRevenue / orders.length : 0),
        [orders, totalRevenue]
    );

    const paidRate = useMemo(() => {
        if (!orders.length) return 0;
        const paid = orders.filter((order) => order.paymentStatus === "Paid").length;
        return Math.round((paid / orders.length) * 100);
    }, [orders]);

    const fulfillmentRate = useMemo(() => {
        if (!orders.length) return 0;
        const delivered = orders.filter((order) => order.status === "Delivered").length;
        return Math.round((delivered / orders.length) * 100);
    }, [orders]);

    const sparklinePoints = useMemo(() => {
        const width = 220;
        const height = 64;
        const padding = 6;
        const step = (width - padding * 2) / Math.max(1, revenueSeries.length - 1);
        return revenueSeries
            .map((value, index) => {
                const x = padding + index * step;
                const y = height - padding - (value / maxRevenue) * (height - padding * 2);
                return `${x},${y}`;
            })
            .join(" ");
    }, [revenueSeries, maxRevenue]);

    const stats = [
        {
            title: "Total Revenue",
            value: `${totalRevenue.toLocaleString()} ETB`,
            change: "Live data",
            isPositive: true,
            icon: TrendingUp
        },
        {
            title: "Total Orders",
            value: `${orders.length}`,
            change: "Live data",
            isPositive: true,
            icon: ShoppingBag
        },
        {
            title: "Total Customers",
            value: `${customerCount}`,
            change: "Live data",
            isPositive: true,
            icon: Users
        },
        {
            title: "Pending Requests",
            value: `${pendingCustomRequests}`,
            change: "Needs action",
            isPositive: pendingCustomRequests === 0,
            icon: Clock
        },
    ];

    const getOrderStatusColor = (status: Order["status"]) => {
        switch (status) {
            case "New":
                return "bg-blue-100 text-blue-700";
            case "Confirmed":
                return "bg-yellow-100 text-yellow-700";
            case "Shipped":
                return "bg-purple-100 text-purple-700";
            case "Delivered":
                return "bg-green-100 text-green-700";
            case "Cancelled":
                return "bg-red-100 text-red-700";
            default:
                return "bg-secondary/20 text-dark";
        }
    };

    const getPaymentStatusColor = (status: Order["paymentStatus"]) => {
        switch (status) {
            case "Paid":
                return "bg-green-100 text-green-700";
            case "Refunded":
                return "bg-red-100 text-red-700";
            case "Pending":
            default:
                return "bg-yellow-100 text-yellow-700";
        }
    };

    const getRequestStatusColor = (status: CustomRequest["status"]) => {
        switch (status) {
            case "PENDING":
                return "bg-yellow-100 text-yellow-700";
            case "QUOTED":
                return "bg-blue-100 text-blue-700";
            case "CONVERTED":
                return "bg-green-100 text-green-700";
            case "REJECTED":
                return "bg-red-100 text-red-700";
            default:
                return "bg-secondary/20 text-dark";
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-display text-3xl font-bold text-dark">Overview</h1>
                <p className="text-dark/60">Welcome back. Here's what's happening today.</p>
            </div>

                {loading ? <p className="text-sm text-dark/40">Loading dashboard data...</p> : null}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title} className="rounded-3xl border-none shadow-sm overflow-hidden group">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-bold uppercase tracking-widest text-dark/40">
                                {stat.title}
                            </CardTitle>
                            <div className="h-10 w-10 rounded-2xl bg-primary/20 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                                <stat.icon className="h-5 w-5" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-dark">{stat.value}</div>
                            <div className="mt-2 flex items-center gap-1 text-xs">
                                {stat.isPositive ? (
                                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                                ) : (
                                    <ArrowDownRight className="h-3 w-3 text-red-500" />
                                )}
                                <span className={stat.isPositive ? "text-green-600" : "text-red-600 font-medium"}>
                                    {stat.change}
                                </span>
                                <span className="text-dark/40 ml-1">updated now</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 rounded-3xl bg-white p-8 shadow-sm">
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h3 className="font-bold text-xl text-dark">Sales Analytics</h3>
                            <p className="text-xs text-dark/50">Last 6 months performance overview.</p>
                        </div>
                        <div className="flex items-center gap-2 rounded-full bg-secondary/5 px-3 py-1 text-xs font-bold text-dark/40">
                            <BarChart3 className="h-3.5 w-3.5" /> Live feed
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-2xl border border-secondary/10 p-4">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-bold uppercase tracking-widest text-dark/40">Avg Order</p>
                                <Wallet className="h-4 w-4 text-accent/60" />
                            </div>
                            <p className="mt-3 text-xl font-bold text-dark">{averageOrderValue.toLocaleString()} ETB</p>
                            <p className="text-xs text-dark/40">Calculated from {orders.length} orders</p>
                        </div>
                        <div className="rounded-2xl border border-secondary/10 p-4">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-bold uppercase tracking-widest text-dark/40">Paid Rate</p>
                                <Percent className="h-4 w-4 text-accent/60" />
                            </div>
                            <p className="mt-3 text-xl font-bold text-dark">{paidRate}%</p>
                            <p className="text-xs text-dark/40">Payments verified</p>
                        </div>
                        <div className="rounded-2xl border border-secondary/10 p-4">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-bold uppercase tracking-widest text-dark/40">Fulfillment</p>
                                <Sparkles className="h-4 w-4 text-accent/60" />
                            </div>
                            <p className="mt-3 text-xl font-bold text-dark">{fulfillmentRate}%</p>
                            <p className="text-xs text-dark/40">Delivered orders</p>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
                        <div className="rounded-2xl border border-secondary/10 p-4">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-bold uppercase tracking-widest text-dark/40">Revenue Trend</p>
                                <span className="text-xs text-dark/40">ETB</span>
                            </div>
                            <div className="mt-3 flex items-end justify-between gap-3">
                                <div className="flex-1">
                                    <svg viewBox="0 0 220 64" className="h-20 w-full">
                                        <defs>
                                            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="rgb(244 63 94)" stopOpacity="0.3" />
                                                <stop offset="100%" stopColor="rgb(244 63 94)" stopOpacity="0" />
                                            </linearGradient>
                                        </defs>
                                        <polyline
                                            points={sparklinePoints}
                                            fill="none"
                                            stroke="rgb(244 63 94)"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <polygon points={`0,64 ${sparklinePoints} 220,64`} fill="url(#revenueGradient)" />
                                    </svg>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-bold text-dark">{totalRevenue.toLocaleString()} ETB</p>
                                    <p className="text-xs text-dark/40">Gross revenue</p>
                                </div>
                            </div>
                            <div className="mt-3 flex justify-between text-[10px] font-bold uppercase tracking-widest text-dark/30">
                                {monthlyBuckets.map((bucket) => (
                                    <span key={bucket.key}>{bucket.label}</span>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-secondary/10 p-4">
                            <p className="text-xs font-bold uppercase tracking-widest text-dark/40">Orders Volume</p>
                            <div className="mt-4 flex flex-col gap-3">
                                {monthlyBuckets.map((bucket) => (
                                    <div key={bucket.key} className="flex items-center gap-3">
                                        <span className="w-8 text-[10px] font-bold uppercase text-dark/40">{bucket.label}</span>
                                        <div className="h-2 flex-1 rounded-full bg-secondary/10">
                                            <div
                                                className="h-2 rounded-full bg-accent"
                                                style={{ width: `${(bucket.orders / maxOrders) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] font-bold text-dark/50">{bucket.orders}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-3xl bg-white p-8 shadow-sm">
                    <h3 className="font-bold text-xl text-dark mb-6">Quick Links</h3>
                    <div className="flex flex-col gap-3">
                        <Link href="/admin/products" className="flex items-center justify-between rounded-2xl border border-secondary/10 px-4 py-3 text-sm font-bold text-dark hover:bg-secondary/5">
                            Manage Products
                            <span className="text-xs text-dark/40">{productCount}</span>
                        </Link>
                        <Link href="/admin/orders" className="flex items-center justify-between rounded-2xl border border-secondary/10 px-4 py-3 text-sm font-bold text-dark hover:bg-secondary/5">
                            Track Orders
                            <span className="text-xs text-dark/40">{orders.length}</span>
                        </Link>
                        <Link href="/admin/customers" className="flex items-center justify-between rounded-2xl border border-secondary/10 px-4 py-3 text-sm font-bold text-dark hover:bg-secondary/5">
                            Customer Directory
                            <span className="text-xs text-dark/40">{customerCount}</span>
                        </Link>
                        <Link href="/admin/custom-requests" className="flex items-center justify-between rounded-2xl border border-secondary/10 px-4 py-3 text-sm font-bold text-dark hover:bg-secondary/5">
                            Custom Requests
                            <span className="text-xs text-dark/40">{pendingCustomRequests} pending</span>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 rounded-3xl bg-white p-8 shadow-sm">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-xl text-dark">Recent Activity</h3>
                            <p className="text-xs text-dark/50">Quick glance at the latest events.</p>
                        </div>
                        <div className="flex items-center gap-2 rounded-full bg-secondary/5 p-1 text-xs font-bold">
                            <button
                                type="button"
                                onClick={() => setRecentTab("orders")}
                                className={cn("rounded-full px-3 py-1", recentTab === "orders" ? "bg-white text-dark shadow-sm" : "text-dark/40")}
                            >
                                Orders
                            </button>
                            <button
                                type="button"
                                onClick={() => setRecentTab("requests")}
                                className={cn("rounded-full px-3 py-1", recentTab === "requests" ? "bg-white text-dark shadow-sm" : "text-dark/40")}
                            >
                                Requests
                            </button>
                        </div>
                    </div>

                    {recentTab === "orders" ? (
                        <div className="flex flex-col gap-4">
                            {recentOrders.length === 0 ? (
                                <div className="text-sm text-dark/40">No recent orders.</div>
                            ) : recentOrders.map((order) => (
                                <div key={order.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-secondary/5 border-b border-secondary/10 last:border-0 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-secondary/10 flex items-center justify-center font-bold text-xs text-dark/40">#{order.orderNumber.slice(-3)}</div>
                                        <div>
                                            <p className="font-bold text-sm text-dark">{order.customerName}</p>
                                            <p className="text-xs text-dark/40">{order.items.length} items • {new Date(order.createdAt).toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-accent">{order.total.toLocaleString()} ETB</p>
                                        <div className="mt-1 flex items-center justify-end gap-1.5">
                                            <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-full", getOrderStatusColor(order.status))}>{order.status}</span>
                                            <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-full", getPaymentStatusColor(order.paymentStatus))}>{order.paymentStatus}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {recentCustomRequests.length === 0 ? (
                                <div className="text-sm text-dark/40">No recent custom requests.</div>
                            ) : recentCustomRequests.map((request) => (
                                <div key={request.id} className="rounded-2xl border border-secondary/10 p-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className="text-sm font-bold text-dark">{request.customerName}</p>
                                            <p className="text-xs text-dark/50">{request.customerPhone}</p>
                                        </div>
                                        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", getRequestStatusColor(request.status))}>
                                            {request.status}
                                        </span>
                                    </div>
                                    <p className="mt-2 line-clamp-2 text-xs text-dark/60">{request.description}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-6">
                    <div className="rounded-3xl bg-white p-8 shadow-sm">
                        <h3 className="font-bold text-xl text-dark mb-6">Quick Actions</h3>
                        <div className="flex flex-col gap-3">
                            <Link href="/admin/products/new" className="w-full rounded-2xl bg-accent text-white py-3 text-sm font-bold shadow-lg shadow-accent/20 hover:scale-[1.02] transition-transform text-center">Add New Product</Link>
                            <Link href="/admin/orders" className="w-full rounded-2xl bg-secondary/10 text-dark py-3 text-sm font-bold hover:bg-secondary/20 transition-colors text-center">View All Orders</Link>
                            <Link href="/admin/custom-requests" className="w-full rounded-2xl bg-secondary/10 text-dark py-3 text-sm font-bold hover:bg-secondary/20 transition-colors text-center">Review Requests</Link>
                            <Link href="/admin/customers" className="w-full rounded-2xl bg-secondary/10 text-dark py-3 text-sm font-bold hover:bg-secondary/20 transition-colors text-center">Manage Customers</Link>
                        </div>
                    </div>

                    <div className="rounded-3xl bg-white p-8 shadow-sm">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="font-bold text-xl text-dark">Highlights</h3>
                            <span className="text-xs font-bold uppercase tracking-wider text-dark/40">Today</span>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="rounded-2xl border border-secondary/10 p-4">
                                <p className="text-xs font-bold uppercase tracking-widest text-dark/40">Pending Requests</p>
                                <p className="mt-2 text-2xl font-bold text-dark">{pendingCustomRequests}</p>
                                <p className="text-xs text-dark/40">Awaiting admin response</p>
                            </div>
                            <div className="rounded-2xl border border-secondary/10 p-4">
                                <p className="text-xs font-bold uppercase tracking-widest text-dark/40">Live Products</p>
                                <p className="mt-2 text-2xl font-bold text-dark">{productCount}</p>
                                <p className="text-xs text-dark/40">Available in catalog</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
