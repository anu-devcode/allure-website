"use client";

import { use, useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { productService } from "@/services/productService";
import { Product } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";
import {
    ShoppingBag, Truck, Info, Check, ChevronLeft, Star, Heart, Share2,
    Package, RotateCcw, Shield, MessageSquare
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface ProductPageProps {
    params: Promise<{ id: string }>;
}

// ─── Tabs ────────────────────────────────────────────
const TAB_KEYS = ["description", "specifications", "reviews", "shipping"] as const;
type TabKey = (typeof TAB_KEYS)[number];

const TAB_LABELS: Record<TabKey, string> = {
    description: "Description",
    specifications: "Specifications",
    reviews: "Reviews",
    shipping: "Shipping & Returns",
};

// Mock data for tabs
const MOCK_SPECS = [
    { label: "Material", value: "Premium Fabric" },
    { label: "Care", value: "Machine Wash Cold, Hang Dry" },
    { label: "Fit", value: "Regular / True to Size" },
    { label: "Season", value: "All Season" },
    { label: "Imported", value: "Yes" },
];

const MOCK_REVIEWS = [
    { name: "Meron K.", rating: 5, date: "2 weeks ago", text: "Absolutely love it! The quality is amazing and it fits perfectly. Highly recommended." },
    { name: "Sara T.", rating: 4, date: "1 month ago", text: "Great product, fast delivery. The color is slightly different from the photo but still beautiful." },
    { name: "Dagim A.", rating: 5, date: "1 month ago", text: "Best purchase I've made. Will definitely order again from Allure." },
];

export default function ProductPage({ params }: ProductPageProps) {
    const { id } = use(params);
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string }>({});
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState<TabKey>("description");
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [imageTransitioning, setImageTransitioning] = useState(false);
    const addItem = useCartStore((state) => state.addItem);

    useEffect(() => {
        async function fetchProduct() {
            setLoading(true);
            const p = await productService.getProductById(id);
            if (p) {
                setProduct(p);
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

    // Build gallery from existing data — no refetch
    const galleryImages = product
        ? [product.image, ...(product.gallery || [])].length > 1
            ? [product.image, ...(product.gallery || [])]
            : [product.image, product.image, product.image, product.image]
        : [];

    const switchImage = useCallback((index: number) => {
        if (index === selectedImageIndex) return;
        setImageTransitioning(true);
        setTimeout(() => {
            setSelectedImageIndex(index);
            setTimeout(() => setImageTransitioning(false), 50);
        }, 150);
    }, [selectedImageIndex]);

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

    const currentImage = galleryImages[selectedImageIndex] || product.image;

    return (
        <div className="animate-page-fade-in">
            <div className="container mx-auto px-4 py-8 md:py-16">
                <Link href="/catalog" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-dark/60 hover:text-accent transition-colors">
                    <ChevronLeft className="h-4 w-4" /> Back to Catalog
                </Link>

                <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
                    {/* ─── Product Gallery ──────────────────────────── */}
                    <div className="flex flex-col gap-4 animate-slide-up-fade">
                        {/* Main Image */}
                        <div className="group relative aspect-[4/5] w-full overflow-hidden rounded-[2.5rem] bg-secondary/5 shadow-2xl">
                            <div
                                className="absolute inset-0 transition-opacity duration-300 ease-out"
                                style={{ opacity: imageTransitioning ? 0 : 1 }}
                            >
                                <Image
                                    src={currentImage}
                                    alt={product.name}
                                    fill
                                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                    priority
                                />
                            </div>
                            {/* Action Buttons */}
                            <div className="absolute right-5 top-5 flex flex-col gap-2.5 z-10">
                                <button className="flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-dark backdrop-blur-md transition-all hover:bg-white hover:text-red-500 hover:scale-110 active:scale-95 shadow-sm">
                                    <Heart className="h-4.5 w-4.5" />
                                </button>
                                <button className="flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-dark backdrop-blur-md transition-all hover:bg-white hover:text-accent hover:scale-110 active:scale-95 shadow-sm">
                                    <Share2 className="h-4.5 w-4.5" />
                                </button>
                            </div>
                        </div>

                        {/* Thumbnails */}
                        <div className="grid grid-cols-4 gap-3">
                            {galleryImages.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => switchImage(i)}
                                    className={`relative aspect-square overflow-hidden rounded-2xl bg-secondary/5 border-2 cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md ${selectedImageIndex === i
                                            ? "border-accent ring-2 ring-accent/20 scale-[0.97]"
                                            : "border-transparent hover:border-accent/30"
                                        }`}
                                >
                                    <Image
                                        src={img}
                                        alt={`${product.name} view ${i + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ─── Product Details ──────────────────────────── */}
                    <div className="flex flex-col gap-7 animate-slide-up-fade [animation-delay:150ms]">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="secondary" className="bg-primary/20 text-accent border-none rounded-full px-4 py-1 font-bold text-xs uppercase tracking-widest">{product.category}</Badge>
                                {product.origin && <Badge variant="outline" className="border-secondary/20 rounded-full px-4 py-1 text-dark/40 font-medium">From {product.origin}</Badge>}
                            </div>
                            <h1 className="font-display text-3xl font-bold tracking-tight text-dark md:text-4xl lg:text-5xl">{product.name}</h1>
                            <div className="flex items-center gap-5 flex-wrap">
                                <p className="font-display text-2xl font-bold text-accent md:text-3xl">{product.price.toLocaleString()} ETB</p>
                                <div className="flex items-center gap-1.5 rounded-full bg-yellow-400/10 px-3 py-1 text-yellow-600">
                                    <Star className="h-4 w-4 fill-current" />
                                    <span className="text-sm font-bold">4.8</span>
                                    <span className="text-xs font-medium text-dark/40 ml-1">(24 reviews)</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-secondary/10" />

                        {/* Short Description */}
                        <p className="text-sm leading-relaxed text-dark/55 md:text-base line-clamp-3">
                            {product.description}
                        </p>

                        {/* Dynamic Variants */}
                        {product.variants.length > 0 && (
                            <div className="flex flex-col gap-5">
                                {product.variants.map((variant) => (
                                    <div key={variant.name} className="flex flex-col gap-3">
                                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-dark/40">{variant.name}</h3>
                                        <div className="flex flex-wrap gap-2.5">
                                            {variant.options.map((option) => (
                                                <button
                                                    key={option}
                                                    onClick={() => setSelectedOptions(prev => ({ ...prev, [variant.name]: option }))}
                                                    className={`h-11 min-w-[3rem] px-4 rounded-xl flex items-center justify-center border-2 font-bold text-sm transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] ${selectedOptions?.[variant.name] === option
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

                        {/* Add to Cart */}
                        <div className="flex flex-col gap-5 mt-2">
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex h-13 items-center rounded-2xl bg-secondary/5 border border-secondary/10 px-1.5">
                                    <button
                                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                        className="h-10 w-10 flex items-center justify-center rounded-xl text-dark/40 hover:text-accent hover:bg-white transition-all active:scale-90"
                                    >−</button>
                                    <span className="w-10 text-center font-bold text-dark">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(q => q + 1)}
                                        className="h-10 w-10 flex items-center justify-center rounded-xl text-dark/40 hover:text-accent hover:bg-white transition-all active:scale-90"
                                    >+</button>
                                </div>
                                <Button
                                    variant="primary"
                                    size="lg"
                                    className="flex-1 h-13 rounded-2xl gap-3 text-base font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                    onClick={handleAddToCart}
                                    disabled={product.availability === "Sold Out"}
                                >
                                    <ShoppingBag className="h-5 w-5" />
                                    {product.availability === "Sold Out" ? "Out of Stock" : `Add to Cart — ${(product.price * quantity).toLocaleString()} ETB`}
                                </Button>
                            </div>

                            {/* Trust Badges */}
                            <div className="grid grid-cols-1 gap-2.5 rounded-2xl bg-primary/5 p-5 border border-primary/10">
                                <div className="flex items-center gap-3 text-sm font-medium text-dark/70">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-accent shadow-sm"><Truck className="h-3.5 w-3.5" /></div>
                                    <span>Free delivery within Addis Ababa</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm font-medium text-dark/70">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-accent shadow-sm"><Info className="h-3.5 w-3.5" /></div>
                                    <span>{product.availability === "Pre-Order" ? `Pre-order: arrives in ${product.estimatedArrival || "10-14 days"}` : "Immediate availability in store"}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm font-medium text-dark/70">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-accent shadow-sm"><Check className="h-3.5 w-3.5" /></div>
                                    <span>100% Quality Guaranteed</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── Tabs Section ─────────────────────────────────── */}
                <div className="mt-16 md:mt-20 animate-slide-up-fade [animation-delay:300ms]">
                    {/* Tab Navigation */}
                    <div className="flex overflow-x-auto gap-1 rounded-2xl bg-secondary/5 border border-secondary/10 p-1 mb-8 scrollbar-none">
                        {TAB_KEYS.map((key) => (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key)}
                                className={`flex-shrink-0 px-5 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === key
                                        ? "bg-white text-dark shadow-sm"
                                        : "text-dark/40 hover:text-dark/60"
                                    }`}
                            >
                                {TAB_LABELS[key]}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="rounded-[2rem] bg-white p-8 md:p-10 border border-secondary/10 shadow-sm min-h-[200px]">
                        {/* Description */}
                        {activeTab === "description" && (
                            <div className="animate-tab-fade-in">
                                <h3 className="font-display text-xl font-bold text-dark mb-4">About This Product</h3>
                                <p className="text-base leading-relaxed text-dark/60 max-w-3xl">
                                    {product.description}
                                </p>
                                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/5">
                                        <Package className="h-5 w-5 text-accent/50" />
                                        <div>
                                            <p className="text-xs font-bold text-dark/40 uppercase tracking-widest">Category</p>
                                            <p className="text-sm font-medium text-dark">{product.category}</p>
                                        </div>
                                    </div>
                                    {product.origin && (
                                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/5">
                                            <Truck className="h-5 w-5 text-accent/50" />
                                            <div>
                                                <p className="text-xs font-bold text-dark/40 uppercase tracking-widest">Origin</p>
                                                <p className="text-sm font-medium text-dark">{product.origin}</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/5">
                                        <Shield className="h-5 w-5 text-accent/50" />
                                        <div>
                                            <p className="text-xs font-bold text-dark/40 uppercase tracking-widest">Status</p>
                                            <p className="text-sm font-medium text-dark">{product.availability}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Specifications */}
                        {activeTab === "specifications" && (
                            <div className="animate-tab-fade-in">
                                <h3 className="font-display text-xl font-bold text-dark mb-6">Specifications</h3>
                                <div className="flex flex-col divide-y divide-secondary/10">
                                    {MOCK_SPECS.map((spec) => (
                                        <div key={spec.label} className="flex items-center justify-between py-4">
                                            <span className="text-sm font-medium text-dark/50">{spec.label}</span>
                                            <span className="text-sm font-bold text-dark">{spec.value}</span>
                                        </div>
                                    ))}
                                    {product.variants.map((v) => (
                                        <div key={v.name} className="flex items-center justify-between py-4">
                                            <span className="text-sm font-medium text-dark/50">Available {v.name}s</span>
                                            <span className="text-sm font-bold text-dark">{v.options.join(", ")}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Reviews */}
                        {activeTab === "reviews" && (
                            <div className="animate-tab-fade-in">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-display text-xl font-bold text-dark">Customer Reviews</h3>
                                    <div className="flex items-center gap-2 text-yellow-500">
                                        <Star className="h-5 w-5 fill-current" />
                                        <span className="font-bold text-dark">4.8</span>
                                        <span className="text-sm text-dark/40">(24 reviews)</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-5">
                                    {MOCK_REVIEWS.map((review, i) => (
                                        <div key={i} className="p-5 rounded-2xl bg-secondary/5 border border-secondary/10">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-full bg-accent/10 flex items-center justify-center">
                                                        <span className="text-xs font-bold text-accent">{review.name.charAt(0)}</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-dark">{review.name}</p>
                                                        <p className="text-xs text-dark/40">{review.date}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-0.5">
                                                    {Array.from({ length: 5 }).map((_, si) => (
                                                        <Star key={si} className={`h-3.5 w-3.5 ${si < review.rating ? "text-yellow-400 fill-current" : "text-secondary/20"}`} />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-sm text-dark/60 leading-relaxed">{review.text}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Shipping & Returns */}
                        {activeTab === "shipping" && (
                            <div className="animate-tab-fade-in">
                                <h3 className="font-display text-xl font-bold text-dark mb-6">Shipping & Returns</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                                                <Truck className="h-5 w-5 text-accent" />
                                            </div>
                                            <h4 className="font-display font-bold text-dark">Delivery</h4>
                                        </div>
                                        <ul className="text-sm text-dark/60 space-y-2 leading-relaxed">
                                            <li>• Free delivery in Addis Ababa</li>
                                            <li>• Standard delivery: 1-3 business days</li>
                                            <li>• Pre-orders: {product.estimatedArrival || "7-14 days"}</li>
                                        </ul>
                                    </div>
                                    <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                                                <RotateCcw className="h-5 w-5 text-accent" />
                                            </div>
                                            <h4 className="font-display font-bold text-dark">Returns</h4>
                                        </div>
                                        <ul className="text-sm text-dark/60 space-y-2 leading-relaxed">
                                            <li>• Return within 3 days of delivery</li>
                                            <li>• Items must be unused with tags</li>
                                            <li>• Full refund for damaged items</li>
                                        </ul>
                                    </div>
                                    <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 sm:col-span-2">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                                                <MessageSquare className="h-5 w-5 text-accent" />
                                            </div>
                                            <h4 className="font-display font-bold text-dark">Need Help?</h4>
                                        </div>
                                        <p className="text-sm text-dark/60 leading-relaxed">
                                            Contact us via Telegram <span className="font-medium text-accent">@AllureOnline</span> or call <span className="font-medium text-accent">0911 223 344</span> for any questions about shipping or returns.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
