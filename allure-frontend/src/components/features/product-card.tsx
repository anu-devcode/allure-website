import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";

import { Product } from "@/types";

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    return (
        <Card className="group overflow-hidden border-none shadow-none hover:shadow-xl transition-all duration-300">
            <Link href={`/product/${product.id}`} className="block relative aspect-[4/5] overflow-hidden rounded-2xl bg-secondary/10">
                <div className="absolute inset-0 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-500">
                    {/* Placeholder for real images */}
                    👗
                </div>
                <div className="absolute left-3 top-3 flex flex-col gap-2">
                    <Badge variant={product.availability === "Sold Out" ? "destructive" : "secondary"} className="shadow-sm">
                        {product.availability}
                    </Badge>
                    {product.origin && (
                        <Badge variant="outline" className="bg-white/80 backdrop-blur-sm shadow-sm border-none text-[10px]">
                            From {product.origin}
                        </Badge>
                    )}
                </div>
            </Link>
            <CardContent className="p-4 flex flex-col gap-1">
                <p className="text-xs font-semibold text-accent/70 uppercase tracking-widest">{product.category}</p>
                <Link href={`/product/${product.id}`}>
                    <h3 className="font-display font-bold text-lg text-dark group-hover:text-accent transition-colors truncate">
                        {product.name}
                    </h3>
                </Link>
                <p className="font-bold text-accent">{product.price.toLocaleString()} ETB</p>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Button className="w-full gap-2 rounded-xl" variant="outline">
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                </Button>
            </CardFooter>
        </Card>
    );
}
