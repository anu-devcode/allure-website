"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ShoppingCart, Plus } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { Product } from "@/types";

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const addItem = useCartStore((state) => state.addItem);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addItem(product, 1, undefined);
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
                    <Badge variant={product.availability === "Sold Out" ? "destructive" : "secondary"} className="shadow-lg border-none px-4 py-1.5 font-bold tracking-tight">
                        {product.availability}
                    </Badge>
                </div>
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
                    <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((_, i) => (
                            <div key={i} className="h-1 w-1 rounded-full bg-yellow-400" />
                        ))}
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
                <Button
                    variant="primary"
                    size="lg"
                    className="w-full gap-2 rounded-2xl h-12 font-bold shadow-lg shadow-primary/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    onClick={handleAddToCart}
                    disabled={product.availability === "Sold Out"}
                >
                    <Plus className="h-4 w-4" />
                    {product.availability === "Sold Out" ? "Out of Stock" : "Add to Bag"}
                </Button>
            </CardFooter>
        </Card>
    );
}
