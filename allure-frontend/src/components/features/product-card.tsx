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

    const handleWishlistToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        await toggleWishlist(product, token);
    };

    return (
        <Card className="group overflow-hidden border-none bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 rounded-[2rem] animate-slide-up-fade">
            <Link href={`/product/${product.id}`} className="block relative aspect-[4/5] overflow-hidden rounded-[1.75rem] m-2">
                <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                <div className="absolute left-4 top-4 flex flex-col gap-2">
                    <Badge variant={isSoldOut ? "destructive" : "secondary"} className="shadow-lg border-none px-4 py-1.5 font-bold tracking-tight">
                        {product.availability}
                    </Badge>
                </div>
                <button
                    onClick={handleWishlistToggle}
                    className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-dark/70 shadow-sm backdrop-blur-md transition-all hover:scale-105 hover:text-red-500"
                    aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                    <Heart className={`h-4 w-4 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
                </button>
                {product.origin && (
                    <div className="absolute bottom-4 left-4">
                        <Badge variant="outline" className="bg-white/90 backdrop-blur-md shadow-sm border-none text-[10px] font-black uppercase tracking-widest px-3 py-1 text-accent">
                            {product.origin}
                        </Badge>
                    </div>
                )}
            </Link>
            <CardContent className="p-5 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-accent/50 uppercase tracking-[0.2em]">{product.category}</p>
                    <div className="flex items-center gap-1 text-xs font-bold text-dark/50">
                        <Star className={`h-3.5 w-3.5 ${product.reviewCount ? "fill-yellow-400 text-yellow-400" : "text-secondary/20"}`} />
                        <span>{product.averageRating ? product.averageRating.toFixed(1) : "—"}</span>
                        <span className="text-dark/30">({product.reviewCount ?? 0})</span>
                    </div>
                </div>
                <Link href={`/product/${product.id}`}>
                    <h3 className="font-display font-bold text-xl text-dark group-hover:text-accent transition-colors truncate tracking-tight">
                        {product.name}
                    </h3>
                </Link>
                <p className="font-display text-lg font-black text-accent">{product.price.toLocaleString()} <span className="text-xs font-bold opacity-60">ETB</span></p>
            </CardContent>
            <CardFooter className="p-5 pt-0">
                {isSoldOut ? (
                    <Button
                        variant="primary"
                        size="lg"
                        className="w-full gap-2 rounded-2xl h-12 font-bold shadow-lg shadow-primary/10 transition-all opacity-60"
                        disabled
                    >
                        Out of Stock
                    </Button>
                ) : quantity > 0 ? (
                    <div className="w-full flex items-center h-12 rounded-2xl overflow-hidden border-2 border-accent/20 bg-accent/5 transition-all shadow-sm">
                        <button
                            onClick={handleDecrement}
                            className="flex items-center justify-center h-full w-14 text-accent hover:bg-accent hover:text-white transition-all active:scale-90"
                        >
                            <Minus className="h-4 w-4" />
                        </button>
                        <div className="flex-1 flex items-center justify-center">
                            <span className="font-display font-bold text-lg text-accent">{quantity}</span>
                        </div>
                        <button
                            onClick={handleIncrement}
                            className="flex items-center justify-center h-full w-14 text-accent hover:bg-accent hover:text-white transition-all active:scale-90"
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <Button
                        variant="primary"
                        size="lg"
                        className="w-full gap-2 rounded-2xl h-12 font-bold shadow-lg shadow-primary/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        onClick={handleAddToCart}
                    >
                        <Plus className="h-4 w-4" />
                        Add to Cart
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
