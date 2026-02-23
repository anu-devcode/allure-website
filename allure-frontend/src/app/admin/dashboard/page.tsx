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
} from "lucide-react";
import Link from "next/link";
import { Order } from "@/types";
import { useAdminAuth } from "@/store/useAdminAuth";
import { adminOrderService } from "@/services/adminOrderService";
import { adminProductService } from "@/services/adminProductService";
import { CustomRequest, getCustomRequests } from "@/services/customRequestService";

export default function AdminDashboard() {
    const token = useAdminAuth((state) => state.token);
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<Order[]>([]);
    const [productCount, setProductCount] = useState(0);
    const [customRequests, setCustomRequests] = useState<CustomRequest[]>([]);

    useEffect(() => {
        const loadDashboardData = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const [ordersResult, productsResult, customRequestsResult] = await Promise.all([
                    adminOrderService.getOrders(token),
                    adminProductService.getProducts(),
                    getCustomRequests(token),
                ]);

                setOrders(ordersResult);
                setProductCount(productsResult.length);
                setCustomRequests(customRequestsResult);
            } catch {
                setOrders([]);
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

    const recentOrders = useMemo(() => orders.slice(0, 3), [orders]);

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
            title: "Total Products",
            value: `${productCount}`,
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

            {/* Recent Activity Table Placeholder */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 rounded-3xl bg-white p-8 shadow-sm">
                    <h3 className="font-bold text-xl text-dark mb-6">Recent Orders</h3>
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
                                    <span className="text-[10px] font-bold uppercase bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">{order.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-3xl bg-white p-8 shadow-sm">
                    <h3 className="font-bold text-xl text-dark mb-6">Quick Actions</h3>
                    <div className="flex flex-col gap-3">
                        <Link href="/admin/products/new" className="w-full rounded-2xl bg-accent text-white py-3 text-sm font-bold shadow-lg shadow-accent/20 hover:scale-[1.02] transition-transform text-center">Add New Product</Link>
                        <Link href="/admin/orders" className="w-full rounded-2xl bg-secondary/10 text-dark py-3 text-sm font-bold hover:bg-secondary/20 transition-colors text-center">View All Orders</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
