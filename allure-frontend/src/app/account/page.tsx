"use client";

import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { useCustomerAuth } from "@/store/useCustomerAuth";
import { ShoppingBag, Package, Sparkles, ArrowRight, TrendingUp } from "lucide-react";

export default function AccountDashboard() {
    const user = useCustomerAuth((s) => s.user);
    const cartItems = useCartStore((s) => s.items);

    if (!user) return null;

    return (
        <div className="animate-slide-up-fade">
            {/* Welcome Header */}
            <div className="mb-8">
                <h1 className="font-display text-2xl font-bold text-dark tracking-tight md:text-3xl">
                    Welcome back, {user.name.split(" ")[0]}!
                </h1>
                <p className="text-sm text-dark/50 mt-1">Here's a quick overview of your account.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="rounded-2xl bg-white p-5 border border-secondary/10 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                            <ShoppingBag className="h-5 w-5 text-accent" />
                        </div>
                        <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    <p className="font-display text-2xl font-bold text-dark">{cartItems.length}</p>
                    <p className="text-xs text-dark/40 mt-0.5">Items in Cart</p>
                </div>

                <div className="rounded-2xl bg-white p-5 border border-secondary/10 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Package className="h-5 w-5 text-accent" />
                        </div>
                    </div>
                    <p className="font-display text-2xl font-bold text-dark">0</p>
                    <p className="text-xs text-dark/40 mt-0.5">Total Orders</p>
                </div>

                <div className="rounded-2xl bg-white p-5 border border-secondary/10 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="h-10 w-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-accent" />
                        </div>
                    </div>
                    <p className="font-display text-2xl font-bold text-dark">0</p>
                    <p className="text-xs text-dark/40 mt-0.5">Custom Orders</p>
                </div>
            </div>

            {/* Quick Actions */}
            <h2 className="font-display text-lg font-bold text-dark mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link href="/catalog" className="group rounded-2xl bg-white p-6 border border-secondary/10 shadow-sm hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all duration-300">
                                <Package className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-display text-sm font-bold text-dark">Browse Catalog</h3>
                                <p className="text-xs text-dark/40 mt-0.5">Explore our latest collection</p>
                            </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-dark/20 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                    </div>
                </Link>

                <Link href="/custom-preorder" className="group rounded-2xl bg-white p-6 border border-secondary/10 shadow-sm hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all duration-300">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-display text-sm font-bold text-dark">Custom Order</h3>
                                <p className="text-xs text-dark/40 mt-0.5">Request from SHEIN or local shops</p>
                            </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-dark/20 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                    </div>
                </Link>

                <Link href="/cart" className="group rounded-2xl bg-white p-6 border border-secondary/10 shadow-sm hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all duration-300">
                                <ShoppingBag className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-display text-sm font-bold text-dark">View Cart</h3>
                                <p className="text-xs text-dark/40 mt-0.5">
                                    {cartItems.length === 0 ? "Your cart is empty" : `${cartItems.length} item${cartItems.length > 1 ? "s" : ""} waiting`}
                                </p>
                            </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-dark/20 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                    </div>
                </Link>

                <Link href="/contact" className="group rounded-2xl bg-white p-6 border border-secondary/10 shadow-sm hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all duration-300">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-display text-sm font-bold text-dark">Contact Support</h3>
                                <p className="text-xs text-dark/40 mt-0.5">Get help with your account</p>
                            </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-dark/20 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                    </div>
                </Link>
            </div>
        </div>
    );
}
