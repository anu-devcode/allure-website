"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Plus, Minus, Heart, Star } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCustomerAuth } from "@/store/useCustomerAuth";
import { Product } from "@/types";

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const addItem = useCartStore((state) => state.addItem);
    const updateQuantity = useCartStore((state) => state.updateQuantity);
    const removeItem = useCartStore((state) => state.removeItem);
    const token = useCustomerAuth((state) => state.token);
    const toggleWishlist = useWishlistStore((state) => state.toggleItem);
    const isWishlisted = useWishlistStore((state) => state.isWishlisted(product.id));
    const cartItem = useCartStore((state) =>
        state.items.find((item) => item.id === product.id)
    );

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addItem(product, 1, undefined);
    };

    const handleIncrement = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (cartItem) {
            updateQuantity(product.id, cartItem.quantity + 1, cartItem.selectedOptions);
        }
    };

    const handleDecrement = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (cartItem) {
            if (cartItem.quantity <= 1) {
                removeItem(product.id, cartItem.selectedOptions);
            } else {
                updateQuantity(product.id, cartItem.quantity - 1, cartItem.selectedOptions);
            }
        }
    };

    const isSoldOut = product.availability === "Sold Out";
    const quantity = cartItem?.quantity ?? 0;
    const activePrice = product.salePrice ?? product.price;

    const handleWishlistToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        await toggleWishlist(product, token);
    };

    return (
        <Card className="group overflow-hidden rounded-[1.15rem] border border-secondary/10 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg animate-slide-up-fade">
            <Link href={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-secondary/5">
                <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2">
                    <div className="flex flex-col gap-1">
                        <Badge variant={isSoldOut ? "destructive" : "secondary"} className="h-6 border-none px-2.5 py-0 text-[9px] font-bold uppercase tracking-[0.16em] shadow-sm">
                            {product.availability}
                        </Badge>
                    </div>
                    <button
                        onClick={handleWishlistToggle}
                        className="z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/92 text-dark/60 shadow-sm backdrop-blur-sm transition-all hover:scale-105 hover:text-red-500"
                        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    >
                        <Heart className={`h-3.5 w-3.5 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
                    </button>
                </div>
            </Link>
            <CardContent className="space-y-2.5 p-3.5">
                <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                        <p className="min-w-0 flex-1 truncate text-[9px] font-black uppercase tracking-[0.18em] text-accent/55">{product.category}</p>
                        {product.badge ? <span className="shrink-0 rounded-full bg-accent/8 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-accent">{product.badge}</span> : null}
                    </div>
                    <div className="min-w-0">
                        <Link href={`/product/${product.id}`}>
                            <h3 className="line-clamp-2 min-h-[2.5rem] text-[0.92rem] font-semibold leading-5 text-dark transition-colors group-hover:text-accent">
                                {product.name}
                            </h3>
                        </Link>
                    </div>
                </div>

                <div className="flex items-end justify-between gap-2">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-end gap-1.5">
                            <p className="text-lg font-extrabold leading-none text-accent">{activePrice.toLocaleString()}</p>
                            <span className="pb-0.5 text-[10px] font-bold uppercase tracking-wider text-dark/40">ETB</span>
                        </div>
                        {(product.salePrice || product.compareAtPrice) ? (
                            <p className="mt-0.5 text-[11px] font-semibold text-dark/30 line-through">
                                {(product.compareAtPrice ?? product.price).toLocaleString()} ETB
                            </p>
                        ) : null}
                    </div>
                    {typeof product.stockQuantity === "number" ? (
                        <span className="rounded-full bg-secondary/5 px-2 py-1 text-[10px] font-semibold text-dark/50">
                            {product.stockQuantity > 0 ? `${product.stockQuantity} stock` : "No stock"}
                        </span>
                    ) : null}
                </div>

                <div className="flex items-center justify-between gap-2 text-[11px] text-dark/45">
                    <div className="flex items-center gap-1">
                        <Star className={`h-3.5 w-3.5 ${product.reviewCount ? "fill-yellow-400 text-yellow-400" : "text-secondary/25"}`} />
                        <span className="font-semibold text-dark/65">{product.reviewCount ? product.averageRating?.toFixed(1) ?? "—" : "—"}</span>
                        <span>({product.reviewCount ?? 0})</span>
                    </div>
                    <div className="flex items-center gap-2 truncate text-right">
                        {product.origin ? <span className="truncate">{product.origin}</span> : null}
                        {product.productType ? <span className="truncate">{product.productType}</span> : null}
                    </div>
                </div>
            </CardContent>
            <CardFooter className="p-3.5 pt-0">
                {isSoldOut ? (
                    <Button
                        variant="primary"
                        size="lg"
                        className="h-9 w-full rounded-xl text-sm font-bold opacity-60 transition-all"
                        disabled
                    >
                        Out of Stock
                    </Button>
                ) : quantity > 0 ? (
                    <div className="flex h-9 w-full items-center overflow-hidden rounded-xl border border-accent/20 bg-accent/5 shadow-sm transition-all">
                        <button
                            onClick={handleDecrement}
                            className="flex h-full w-9 items-center justify-center text-accent transition-all hover:bg-accent hover:text-white active:scale-90"
                        >
                            <Minus className="h-3.5 w-3.5" />
                        </button>
                        <div className="flex min-w-0 flex-1 items-center justify-between px-2.5">
                            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-accent/70">In cart</span>
                            <span className="text-sm font-bold text-accent">{quantity}</span>
                        </div>
                        <button
                            onClick={handleIncrement}
                            className="flex h-full w-9 items-center justify-center text-accent transition-all hover:bg-accent hover:text-white active:scale-90"
                        >
                            <Plus className="h-3.5 w-3.5" />
                        </button>
                    </div>
                ) : (
                    <div className="flex w-full items-center gap-2">
                        <Button
                            variant="primary"
                            size="lg"
                            className="h-9 flex-1 gap-1.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.01] active:scale-[0.98]"
                            onClick={handleAddToCart}
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Add
                        </Button>
                        <Link href={`/product/${product.id}`} className="flex h-9 min-w-[4.5rem] items-center justify-center rounded-xl border border-secondary/15 bg-secondary/5 px-3 text-[11px] font-semibold text-dark/65 transition-colors hover:bg-secondary/10 hover:text-dark">
                            Details
                        </Link>
                    </div>
                )}
            </CardFooter>
        </Card>
    );
}
