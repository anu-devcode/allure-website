"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCustomerAuth } from "@/store/useCustomerAuth";
import { useCartStore } from "@/store/useCartStore";

export default function WishlistPage() {
    const token = useCustomerAuth((state) => state.token);
    const items = useWishlistStore((state) => state.items);
    const loading = useWishlistStore((state) => state.loading);
    const removeItem = useWishlistStore((state) => state.removeItem);
    const addToCart = useCartStore((state) => state.addItem);

    const handleRemove = async (productId: string) => {
        await removeItem(productId, token);
    };

    return (
        <div className="animate-slide-up-fade">
            <div className="mb-8">
                <h1 className="font-display text-2xl font-bold text-dark tracking-tight md:text-3xl">Wishlist</h1>
                <p className="text-sm text-dark/50 mt-1">Items you've saved for later.</p>
            </div>

            {loading ? (
                <div className="rounded-[2rem] bg-white p-12 border border-secondary/10 shadow-sm text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
                </div>
            ) : items.length === 0 ? (
                <div className="rounded-[2rem] bg-white p-12 border border-secondary/10 shadow-sm text-center">
                    <div className="h-16 w-16 rounded-full bg-secondary/5 flex items-center justify-center mx-auto mb-4">
                        <Heart className="h-7 w-7 text-dark/20" />
                    </div>
                    <h3 className="font-display text-lg font-bold text-dark/40 mb-1">No saved items</h3>
                    <p className="text-sm text-dark/30 max-w-xs mx-auto">Browse the catalog and tap the heart icon to save items here.</p>
                </div>
            ) : (
                <div className="rounded-[2rem] bg-white p-6 md:p-8 border border-secondary/10 shadow-sm flex flex-col gap-4">
                    {items.map((item) => (
                        <div key={item.id} className="flex flex-col gap-3 rounded-2xl border border-secondary/10 p-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-secondary/5">
                                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                                </div>
                                <div>
                                    <Link href={`/product/${item.id}`} className="font-display text-lg font-bold text-dark hover:text-accent transition-colors">
                                        {item.name}
                                    </Link>
                                    <p className="text-sm text-dark/45">{item.category}</p>
                                    <p className="text-sm font-bold text-accent mt-1">{item.price.toLocaleString()} ETB</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 md:justify-end">
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => addToCart(item, 1, undefined)}
                                >
                                    Add to Cart
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRemove(item.id)}
                                >
                                    Remove
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
