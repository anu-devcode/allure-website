"use client";

import { use, useState } from "react";
import { MOCK_PRODUCTS } from "@/data/mock-products";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";
import { ShoppingBag, Truck, Info, Check, ChevronLeft, Star } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface ProductPageProps {
    params: Promise<{ id: string }>;
}

export default function ProductPage({ params }: ProductPageProps) {
    const { id } = use(params);
    const product = MOCK_PRODUCTS.find((p) => p.id === id);

    // Initial selected options based on variants
    const initialOptions = product?.variants.reduce((acc, v) => ({
        ...acc,
        [v.name]: v.options[0]
    }), {} as { [key: string]: string });

    const [selectedOptions, setSelectedOptions] = useState(initialOptions);
    const [quantity, setQuantity] = useState(1);
    const addItem = useCartStore((state) => state.addItem);

    if (!product) return notFound();

    const handleAddToCart = () => {
        addItem(product, quantity, selectedOptions);
    };

    return (
        <div className="container mx-auto px-4 py-12">
            <Link href="/catalog" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-dark/60 hover:text-accent">
                <ChevronLeft className="h-4 w-4" /> Back to Catalog
            </Link>

            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                {/* Gallery Placeholder */}
                <div className="flex flex-col gap-4">
                    <div className="aspect-[4/5] w-full rounded-3xl bg-secondary/10 flex items-center justify-center text-8xl">
                        👗
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="aspect-square rounded-xl bg-secondary/5 border border-secondary/10 hover:border-accent cursor-pointer transition-colors" />
                        ))}
                    </div>
                </div>

                {/* Product Details */}
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary">{product.category}</Badge>
                            {product.origin && <Badge variant="outline">From {product.origin}</Badge>}
                        </div>
                        <h1 className="font-display text-4xl font-bold text-dark">{product.name}</h1>
                        <div className="flex items-center gap-4">
                            <p className="text-3xl font-bold text-accent">{product.price.toLocaleString()} ETB</p>
                            <div className="flex items-center gap-1 text-yellow-500">
                                <Star className="h-4 w-4 fill-current" />
                                <span className="text-sm font-bold">4.8</span>
                                <span className="text-xs text-dark/40">(12 reviews)</span>
                            </div>
                        </div>
                    </div>

                    <p className="text-dark/60 leading-relaxed">
                        Beautifully crafted {product.name.toLowerCase()} that blends modern urban style with classic elegance.
                        Perfect for social events or daily wear. Fast delivery guaranteed.
                    </p>

                    <div className="h-px bg-secondary/20" />

                    {/* Dynamic Variants */}
                    {product.variants.map((variant) => (
                        <div key={variant.name} className="flex flex-col gap-3">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-dark">{variant.name}</h3>
                            <div className="flex flex-wrap gap-3">
                                {variant.options.map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => setSelectedOptions(prev => ({ ...prev, [variant.name]: option }))}
                                        className={`h-12 min-w-[3rem] px-4 rounded-xl flex items-center justify-center border-2 transition-all ${selectedOptions?.[variant.name] === option
                                            ? "border-accent bg-accent text-white"
                                            : "border-secondary/20 hover:border-accent/40"
                                            }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Add to Cart */}
                    <div className="mt-4 flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 items-center rounded-2xl border border-secondary/20">
                                <button
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    className="p-4 text-dark/40 hover:text-dark"
                                >-</button>
                                <span className="w-8 text-center font-bold">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(q => q + 1)}
                                    className="p-4 text-dark/40 hover:text-dark"
                                >+</button>
                            </div>
                            <Button
                                variant="primary"
                                size="lg"
                                className="flex-1 h-14 rounded-2xl gap-3 text-lg"
                                onClick={handleAddToCart}
                                disabled={product.availability === "Sold Out"}
                            >
                                <ShoppingBag className="h-5 w-5" />
                                {product.availability === "Sold Out" ? "Sold Out" : `Add to Cart — ${(product.price * quantity).toLocaleString()} ETB`}
                            </Button>
                        </div>

                        {/* Availability info */}
                        <div className="flex flex-col gap-2 rounded-2xl bg-secondary/10 p-4 text-sm">
                            <div className="flex items-center gap-2 text-dark/70">
                                <Truck className="h-4 w-4 text-accent" />
                                <span>Free delivery in Addis Ababa</span>
                            </div>
                            <div className="flex items-center gap-2 text-dark/70">
                                <Info className="h-4 w-4 text-accent" />
                                <span>{product.availability === "Pre-Order" ? `Estimated arrival: ${product.estimatedArrival || "10-14 days"}` : "Available for immediate delivery"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-dark/70">
                                <Check className="h-4 w-4 text-accent" />
                                <span>100% Authentic Product</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
