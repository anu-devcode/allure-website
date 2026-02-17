"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import { productService } from "@/services/productService";
import { Product } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";
import { ShoppingBag, Truck, Info, Check, ChevronLeft, Star, Heart, Share2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface ProductPageProps {
    params: Promise<{ id: string }>;
}

export default function ProductPage({ params }: ProductPageProps) {
    const { id } = use(params);
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string }>({});
    const [quantity, setQuantity] = useState(1);
    const addItem = useCartStore((state) => state.addItem);

    useEffect(() => {
        async function fetchProduct() {
            setLoading(true);
            const p = await productService.getProductById(id);
            if (p) {
                setProduct(p);
                // Set initial options
                const initial = p.variants.reduce((acc, v) => ({
                    ...acc,
                    [v.name]: v.options[0]
                }), {} as { [key: string]: string });
                setSelectedOptions(initial);
            }
            setLoading(false);
        }
        fetchProduct();
    }, [id]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-24 flex items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!product) return notFound();

    const handleAddToCart = () => {
        addItem(product, quantity, selectedOptions);
    };

    return (
        <div className="container mx-auto px-4 py-8 md:py-16">
            <Link href="/catalog" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-dark/60 hover:text-accent transition-colors">
                <ChevronLeft className="h-4 w-4" /> Back to Catalog
            </Link>

            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                {/* Product Gallery */}
                <div className="flex flex-col gap-6 animate-slide-up-fade">
                    <div className="group relative aspect-[4/5] w-full overflow-hidden rounded-[2.5rem] bg-secondary/5 shadow-2xl">
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                            priority
                        />
                        <div className="absolute right-6 top-6 flex flex-col gap-3">
                            <button className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-dark backdrop-blur-md transition-all hover:bg-white hover:text-red-500 shadow-sm">
                                <Heart className="h-5 w-5" />
                            </button>
                            <button className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-dark backdrop-blur-md transition-all hover:bg-white hover:text-accent shadow-sm">
                                <Share2 className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                    {/* Thumbnails (Mocked) */}
                    <div className="grid grid-cols-4 gap-4">
                        {[product.image, product.image, product.image, product.image].map((img, i) => (
                            <div key={i} className="relative aspect-square overflow-hidden rounded-2xl bg-secondary/5 border-2 border-transparent hover:border-accent cursor-pointer transition-all shadow-sm">
                                <Image
                                    src={img}
                                    alt={`${product.name} view ${i + 1}`}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Product Details */}
                <div className="flex flex-col gap-8 animate-slide-up-fade [animation-delay:200ms]">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-primary/20 text-accent border-none rounded-full px-4 py-1 font-bold text-xs uppercase tracking-widest">{product.category}</Badge>
                            {product.origin && <Badge variant="outline" className="border-secondary/20 rounded-full px-4 py-1 text-dark/40 font-medium">From {product.origin}</Badge>}
                        </div>
                        <h1 className="font-display text-4xl font-bold tracking-tight text-dark md:text-5xl lg:text-6xl">{product.name}</h1>
                        <div className="flex items-center gap-6">
                            <p className="font-display text-3xl font-bold text-accent">{product.price.toLocaleString()} ETB</p>
                            <div className="flex items-center gap-1.5 rounded-full bg-yellow-400/10 px-3 py-1 text-yellow-600">
                                <Star className="h-4 w-4 fill-current" />
                                <span className="text-sm font-bold">4.8</span>
                                <span className="text-xs font-medium text-dark/40 ml-1">(24 reviews)</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-secondary/20" />

                    <div className="flex flex-col gap-3">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-dark/40">Description</h3>
                        <p className="text-base leading-relaxed text-dark/60 md:text-lg">
                            {product.description}
                        </p>
                    </div>

                    {/* Dynamic Variants */}
                    {product.variants.length > 0 && (
                        <div className="flex flex-col gap-6">
                            {product.variants.map((variant) => (
                                <div key={variant.name} className="flex flex-col gap-4">
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-dark/40">{variant.name}</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {variant.options.map((option) => (
                                            <button
                                                key={option}
                                                onClick={() => setSelectedOptions(prev => ({ ...prev, [variant.name]: option }))}
                                                className={`h-12 min-w-[3.5rem] px-5 rounded-xl flex items-center justify-center border-2 font-bold transition-all duration-300 ${selectedOptions?.[variant.name] === option
                                                    ? "border-accent bg-accent text-white shadow-lg shadow-accent/20"
                                                    : "border-secondary/10 bg-white text-dark/60 hover:border-accent/40 hover:text-dark shadow-sm"
                                                    }`}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add to Cart Actions */}
                    <div className="mt-4 flex flex-col gap-6">
                        <div className="flex flex-wrap items-center gap-5">
                            <div className="flex h-14 items-center rounded-2xl bg-secondary/5 border border-secondary/10 px-2">
                                <button
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    className="p-3 text-dark/40 hover:text-accent transition-colors"
                                >-</button>
                                <span className="w-10 text-center font-bold text-dark">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(q => q + 1)}
                                    className="p-3 text-dark/40 hover:text-accent transition-colors"
                                >+</button>
                            </div>
                            <Button
                                variant="primary"
                                size="lg"
                                className="flex-1 h-14 rounded-2xl gap-3 text-lg font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                onClick={handleAddToCart}
                                disabled={product.availability === "Sold Out"}
                            >
                                <ShoppingBag className="h-5 w-5" />
                                {product.availability === "Sold Out" ? "Out of Stock" : `Add to Cart — ${(product.price * quantity).toLocaleString()} ETB`}
                            </Button>
                        </div>

                        {/* Trust Badges / Info */}
                        <div className="grid grid-cols-1 gap-3 rounded-3xl bg-primary/5 p-6 border border-primary/10">
                            <div className="flex items-center gap-3 text-sm font-medium text-dark/70">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-accent shadow-sm"><Truck className="h-4 w-4" /></div>
                                <span>Free delivery within Addis Ababa</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm font-medium text-dark/70">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-accent shadow-sm"><Info className="h-4 w-4" /></div>
                                <span>{product.availability === "Pre-Order" ? `Pre-order: arrives in ${product.estimatedArrival || "10-14 days"}` : "Immediate availability in store"}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm font-medium text-dark/70">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-accent shadow-sm"><Check className="h-4 w-4" /></div>
                                <span>100% Quality Guaranteed</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
