"use client";

import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function SideCart() {
    const { items, isCartOpen, setCartOpen, updateQuantity, removeItem, getTotalPrice } = useCartStore();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Prevent scrolling when cart is open
    useEffect(() => {
        if (isCartOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isCartOpen]);

    if (!isMounted) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className={cn(
                    "fixed inset-0 z-[100] bg-dark/40 backdrop-blur-sm transition-opacity duration-500 ease-in-out",
                    isCartOpen ? "opacity-100" : "pointer-events-none opacity-0"
                )}
                onClick={() => setCartOpen(false)}
            />

            {/* Drawer */}
            <div
                className={cn(
                    "fixed right-0 top-0 z-[101] h-screen w-full max-w-[450px] bg-white shadow-2xl transition-transform duration-500 ease-in-out sm:rounded-l-[3rem]",
                    isCartOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                <div className="flex h-full flex-col p-6 sm:p-10">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/20 p-3 rounded-2xl">
                                <ShoppingBag className="h-6 w-6 text-accent" />
                            </div>
                            <div>
                                <h2 className="font-display text-2xl font-bold text-dark">Your Cart</h2>
                                <p className="text-[10px] font-black uppercase tracking-widest text-dark/30">
                                    {items.reduce((acc, item) => acc + item.quantity, 0)} Items
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setCartOpen(false)}
                            className="group rounded-full bg-secondary/5 p-3 text-dark/40 transition-all hover:bg-red-50 hover:text-red-500"
                        >
                            <X className="h-6 w-6 transition-transform group-hover:rotate-90" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-grow overflow-y-auto no-scrollbar -mx-4 px-4 py-2">
                        {items.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center gap-6 text-center animate-in fade-in zoom-in duration-500">
                                <div className="bg-secondary/5 p-10 rounded-full">
                                    <ShoppingBag className="h-12 w-12 text-dark/10" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <p className="font-bold text-dark">Your cart is empty</p>
                                    <p className="text-sm text-dark/40 max-w-[200px]">Aesthetics are waiting to be shared.</p>
                                </div>
                                <Button
                                    variant="outline"
                                    className="rounded-full px-8"
                                    onClick={() => setCartOpen(false)}
                                >
                                    Browse Catalog
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-6">
                                {items.map((item) => (
                                    <div
                                        key={`${item.id}-${JSON.stringify(item.selectedOptions)}`}
                                        className="group relative flex gap-4 rounded-[2rem] border border-secondary/5 bg-white p-3 shadow-sm transition-all hover:shadow-md animate-in slide-in-from-right duration-500 mb-2"
                                    >
                                        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-secondary/5">
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex flex-grow flex-col justify-between py-1">
                                            <div>
                                                <h3 className="font-bold text-dark line-clamp-1">{item.name}</h3>
                                                {item.selectedOptions && Object.entries(item.selectedOptions).map(([k, v]) => (
                                                    <span key={k} className="text-[9px] font-black uppercase tracking-tighter text-dark/30">
                                                        {k}: {v}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="flex items-center justify-between mb-0.5">
                                                <div className="flex items-center rounded-xl bg-secondary/5 px-1.5 h-8">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedOptions)}
                                                        className="p-1.5 text-dark/30 hover:text-accent transition-colors"
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </button>
                                                    <span className="w-6 text-center text-xs font-bold text-dark">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedOptions)}
                                                        className="p-1.5 text-dark/30 hover:text-accent transition-colors"
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </button>
                                                </div>
                                                <p className="font-bold text-accent text-sm">
                                                    {(item.price * item.quantity).toLocaleString()} ETB
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeItem(item.id, item.selectedOptions)}
                                            className="absolute -right-2 -top-2 rounded-full bg-white p-1.5 text-dark/10 shadow-md transition-colors hover:text-red-500 opacity-0 group-hover:opacity-100"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {items.length > 0 && (
                        <div className="mt-8 flex flex-col gap-6 border-t border-secondary/10 pt-8 animate-in slide-in-from-bottom duration-500">
                            <div className="flex items-end justify-between">
                                <p className="text-sm font-medium text-dark/40 uppercase tracking-widest">Subtotal</p>
                                <p className="text-3xl font-black text-dark">{getTotalPrice().toLocaleString()} ETB</p>
                            </div>
                            <div className="flex flex-col gap-3">
                                <Link href="/checkout" className="w-full" onClick={() => setCartOpen(false)}>
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        className="h-16 w-full rounded-2xl gap-3 text-lg font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                    >
                                        Checkout Now <ArrowRight className="h-5 w-5" />
                                    </Button>
                                </Link>
                                <Link href="/cart" className="w-full" onClick={() => setCartOpen(false)}>
                                    <Button
                                        variant="ghost"
                                        className="h-14 w-full rounded-2xl font-bold text-dark/60 hover:text-dark hover:bg-secondary/5"
                                    >
                                        View Full Cart
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
