"use client";

import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function CartPage() {
    const { items, updateQuantity, removeItem, getTotalPrice } = useCartStore();

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-24 text-center">
                <div className="flex flex-col items-center gap-6">
                    <div className="bg-secondary/10 p-8 rounded-full">
                        <ShoppingBag className="h-16 w-16 text-accent/40" />
                    </div>
                    <h1 className="font-display text-3xl font-bold text-dark">Your cart is empty</h1>
                    <p className="text-dark/60 max-w-sm">Looks like you haven't added anything to your cart yet. Start shopping to find your allure!</p>
                    <Link href="/catalog">
                        <Button size="lg" className="rounded-full px-10 h-14">Continue Shopping</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-16">
            <h1 className="font-display text-4xl font-bold text-dark mb-12">Shopping Bag</h1>

            <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
                {/* Items List */}
                <div className="lg:col-span-2 flex flex-col gap-8">
                    {items.map((item) => (
                        <div key={`${item.id}-${JSON.stringify(item.selectedOptions)}`} className="flex gap-6 border-b border-secondary/20 pb-8 last:border-0">
                            <div className="h-32 w-24 flex-shrink-0 rounded-2xl bg-secondary/10 flex items-center justify-center text-4xl">
                                👗
                            </div>
                            <div className="flex flex-grow flex-col gap-1">
                                <div className="flex justify-between">
                                    <h3 className="font-display font-bold text-lg text-dark">{item.name}</h3>
                                    <button onClick={() => removeItem(item.id, item.selectedOptions)} className="text-dark/20 hover:text-red-500">
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                                {item.selectedOptions && Object.entries(item.selectedOptions).length > 0 && (
                                    <p className="text-sm text-dark/40">
                                        {Object.entries(item.selectedOptions).map(([key, val], i) => (
                                            <span key={key}>{i > 0 && " | "}{key}: {val}</span>
                                        ))}
                                    </p>
                                )}
                                <div className="mt-auto flex items-center justify-between">
                                    <div className="flex items-center rounded-xl border border-secondary/20">
                                        <button onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedOptions)} className="px-3 py-1 text-dark/40 hover:text-dark">
                                            <Minus className="h-4 w-4" />
                                        </button>
                                        <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedOptions)} className="px-3 py-1 text-dark/40 hover:text-dark">
                                            <Plus className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <p className="font-bold text-accent">{(item.price * item.quantity).toLocaleString()} ETB</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary */}
                <aside>
                    <div className="sticky top-24 rounded-3xl bg-secondary/5 p-8 flex flex-col gap-6">
                        <h2 className="font-display text-2xl font-bold text-dark">Order Summary</h2>
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between text-dark/60">
                                <span>Subtotal</span>
                                <span>{getTotalPrice().toLocaleString()} ETB</span>
                            </div>
                            <div className="flex justify-between text-dark/60">
                                <span>Delivery</span>
                                <span className="text-accent font-bold">Free (Addis Ababa)</span>
                            </div>
                            <div className="h-px bg-secondary/20 my-2" />
                            <div className="flex justify-between items-end">
                                <span className="font-bold text-dark">Total</span>
                                <span className="text-2xl font-bold text-accent">{getTotalPrice().toLocaleString()} ETB</span>
                            </div>
                        </div>
                        <Link href="/checkout">
                            <Button variant="primary" size="lg" className="w-full h-14 rounded-2xl gap-2 text-lg">
                                Proceed to Checkout <ArrowRight className="h-5 w-5" />
                            </Button>
                        </Link>
                        <p className="text-center text-[10px] text-dark/40 uppercase tracking-widest font-bold">
                            Secure Manual Payments Only
                        </p>
                    </div>
                </aside>
            </div>
        </div>
    );
}
