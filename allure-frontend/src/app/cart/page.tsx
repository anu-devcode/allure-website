"use client";

import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ChevronLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function CartPage() {
    const { items, updateQuantity, removeItem, getTotalPrice } = useCartStore();

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-24 text-center">
                <div className="flex flex-col items-center gap-8 animate-slide-up-fade">
                    <div className="relative">
                        <div className="bg-primary/20 p-10 rounded-full animate-pulse transition-all duration-1000">
                            <ShoppingBag className="h-16 w-16 text-accent" />
                        </div>
                        <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-lg">
                            <span className="text-xl">✨</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3">
                        <h1 className="font-display text-4xl font-bold text-dark">Your bag is empty</h1>
                        <p className="text-dark/60 max-w-sm mx-auto text-lg italic">"Aesthetics are meaningful only when shared."</p>
                    </div>
                    <Link href="/catalog">
                        <Button size="lg" className="rounded-full px-12 h-14 font-bold shadow-xl shadow-primary/20 hover:scale-[1.05] transition-all">Start Exploring</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 md:py-20">
            <div className="flex flex-col gap-2 mb-12">
                <Link href="/catalog" className="inline-flex items-center gap-2 text-sm font-medium text-dark/60 hover:text-accent transition-colors">
                    <ChevronLeft className="h-4 w-4" /> Back to Shopping
                </Link>
                <h1 className="font-display text-4xl font-bold text-dark md:text-5xl tracking-tight">Shopping Bag</h1>
            </div>

            <div className="grid grid-cols-1 gap-16 lg:grid-cols-3">
                {/* Items List */}
                <div className="lg:col-span-2 flex flex-col gap-10">
                    <div className="flex flex-col gap-8">
                        {items.map((item) => (
                            <div key={`${item.id}-${JSON.stringify(item.selectedOptions)}`} className="group flex flex-col sm:flex-row gap-6 border-b border-secondary/10 pb-8 last:border-0 animate-slide-up-fade">
                                <div className="relative h-40 w-32 flex-shrink-0 overflow-hidden rounded-3xl bg-secondary/5 shadow-md">
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                                <div className="flex flex-grow flex-col gap-2">
                                    <div className="flex justify-between items-start">
                                        <div className="flex flex-col gap-1">
                                            <h3 className="font-display font-bold text-xl text-dark group-hover:text-accent transition-colors">{item.name}</h3>
                                            <p className="text-xs font-bold text-accent/60 uppercase tracking-widest">{item.category}</p>
                                        </div>
                                        <button onClick={() => removeItem(item.id, item.selectedOptions)} className="text-dark/10 hover:text-red-500 transition-colors p-2">
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                    {item.selectedOptions && Object.entries(item.selectedOptions).length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {Object.entries(item.selectedOptions).map(([key, val]) => (
                                                <span key={key} className="px-3 py-1 bg-secondary/10 rounded-full text-[10px] font-black uppercase tracking-wider text-dark/40">
                                                    {key}: <span className="text-dark/80">{val}</span>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    <div className="mt-auto flex items-center justify-between pt-4">
                                        <div className="flex items-center rounded-2xl bg-secondary/5 border border-secondary/10 px-2 h-10">
                                            <button onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedOptions)} className="p-2 text-dark/30 hover:text-accent transition-colors">
                                                <Minus className="h-3 w-3" />
                                            </button>
                                            <span className="w-10 text-center text-sm font-bold text-dark">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedOptions)} className="p-2 text-dark/30 hover:text-accent transition-colors">
                                                <Plus className="h-3 w-3" />
                                            </button>
                                        </div>
                                        <p className="font-display text-xl font-bold text-accent">{(item.price * item.quantity).toLocaleString()} ETB</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Summary */}
                <aside className="animate-slide-up-fade [animation-delay:200ms]">
                    <div className="sticky top-28 rounded-[2.5rem] bg-secondary/5 p-10 flex flex-col gap-8 shadow-sm border border-secondary/10">
                        <div className="flex flex-col gap-2">
                            <h2 className="font-display text-2xl font-bold text-dark">Order Summary</h2>
                            <p className="text-xs font-medium text-dark/40 uppercase tracking-widest">Handled with Allure</p>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="flex justify-between text-base text-dark/60 font-medium">
                                <span>Subtotal</span>
                                <span className="text-dark">{getTotalPrice().toLocaleString()} ETB</span>
                            </div>
                            <div className="flex justify-between text-base text-dark/60 font-medium">
                                <span>Delivery</span>
                                <span className="text-accent font-bold">Complimentary</span>
                            </div>
                            <div className="h-px bg-secondary/20 my-2" />
                            <div className="flex justify-between items-end">
                                <span className="text-lg font-bold text-dark">Total</span>
                                <div className="text-right">
                                    <span className="text-3xl font-bold text-accent block">{getTotalPrice().toLocaleString()} ETB</span>
                                    <span className="text-[10px] text-dark/40 font-bold uppercase tracking-tight">Taxes included</span>
                                </div>
                            </div>
                        </div>
                        <Link href="/checkout">
                            <Button variant="primary" size="lg" className="w-full h-16 rounded-2xl gap-3 text-lg font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                                Checkout <ArrowRight className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div className="flex items-center justify-center gap-2 mt-2">
                            <div className="h-1 w-1 rounded-full bg-accent" />
                            <p className="text-[9px] text-dark/40 uppercase tracking-[0.2em] font-black">
                                Manual Secure Payments
                            </p>
                            <div className="h-1 w-1 rounded-full bg-accent" />
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
