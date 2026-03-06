"use client";

import { use, useEffect, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { productService } from "@/services/productService";
import { Product, Review } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCustomerAuth } from "@/store/useCustomerAuth";
import { reviewService } from "@/services/reviewService";
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

// Static data for specs fallback
const MOCK_SPECS = [
    { label: "Material", value: "Premium Fabric" },
    { label: "Care", value: "Machine Wash Cold, Hang Dry" },
    { label: "Fit", value: "Regular / True to Size" },
    { label: "Season", value: "All Season" },
    { label: "Imported", value: "Yes" },
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
    const [reviews, setReviews] = useState<Review[]>([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [reviewSummary, setReviewSummary] = useState({ averageRating: 0, reviewCount: 0 });
    const [reviewEligibility, setReviewEligibility] = useState<{ canReview: boolean; hasReviewed: boolean; availableOrders: Array<{ id: string; orderNumber: string; createdAt: string }>; latestReview: Review | null } | null>(null);
    const [reviewForm, setReviewForm] = useState({ orderId: "", rating: 5, comment: "" });
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [reviewMessage, setReviewMessage] = useState<string | null>(null);
    const [reviewError, setReviewError] = useState<string | null>(null);
    const addItem = useCartStore((state) => state.addItem);
    const token = useCustomerAuth((state) => state.token);
    const isAuthenticated = useCustomerAuth((state) => state.isAuthenticated);
    const toggleWishlist = useWishlistStore((state) => state.toggleItem);
    const isWishlisted = useWishlistStore((state) => (product ? state.isWishlisted(product.id) : false));

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

    useEffect(() => {
        const fetchReviews = async () => {
            setReviewsLoading(true);
            try {
                const data = await reviewService.getProductReviews(id);
                setReviews(data.reviews);
                setReviewSummary({
                    averageRating: data.summary.averageRating ?? 0,
                    reviewCount: data.summary.reviewCount,
                });
            } catch {
                setReviews([]);
                setReviewSummary({ averageRating: 0, reviewCount: 0 });
            } finally {
                setReviewsLoading(false);
            }
        };

        void fetchReviews();
    }, [id]);

    useEffect(() => {
        const fetchEligibility = async () => {
            if (!token) {
                setReviewEligibility(null);
                return;
            }

            try {
                const data = await reviewService.getReviewEligibility(id, token);
                setReviewEligibility(data);
                setReviewForm((current) => ({
                    ...current,
                    orderId: current.orderId || data.availableOrders[0]?.id || "",
                }));
            } catch {
                setReviewEligibility(null);
            }
        };

        void fetchEligibility();
    }, [id, token]);

    const handleSubmitReview = async () => {
        if (!token || !reviewEligibility?.canReview || !reviewForm.orderId || !reviewForm.comment.trim()) {
            setReviewError("Select an eligible order and write a review comment.");
            return;
        }

        try {
            setReviewSubmitting(true);
            setReviewError(null);
            setReviewMessage(null);
            await reviewService.submitReview(token, {
                productId: id,
                orderId: reviewForm.orderId,
                rating: reviewForm.rating,
                comment: reviewForm.comment.trim(),
            });
            const [reviewData, eligibilityData] = await Promise.all([
                reviewService.getProductReviews(id),
                reviewService.getReviewEligibility(id, token),
            ]);
            setReviews(reviewData.reviews);
            setReviewSummary({
                averageRating: reviewData.summary.averageRating ?? 0,
                reviewCount: reviewData.summary.reviewCount,
            });
            setReviewEligibility(eligibilityData);
            setReviewForm({ orderId: eligibilityData.availableOrders[0]?.id || "", rating: 5, comment: "" });
            setReviewMessage("Review submitted successfully. It will appear after approval.");
        } catch {
            setReviewError("Could not submit your review right now.");
        } finally {
            setReviewSubmitting(false);
        }
    };

    const displayRating = useMemo(() => {
        if (product?.averageRating) {
            return product.averageRating;
        }
        return reviewSummary.averageRating || 0;
    }, [product?.averageRating, reviewSummary.averageRating]);

    const displayReviewCount = product?.reviewCount ?? reviewSummary.reviewCount;

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

    const handleWishlistToggle = async () => {
        await toggleWishlist(product, token);
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
                                <button
                                    onClick={handleWishlistToggle}
                                    className="flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-dark backdrop-blur-md transition-all hover:bg-white hover:text-red-500 hover:scale-110 active:scale-95 shadow-sm"
                                >
                                    <Heart className={`h-4.5 w-4.5 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
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
                                    <span className="text-sm font-bold">{displayReviewCount ? displayRating.toFixed(1) : "—"}</span>
                                    <span className="text-xs font-medium text-dark/40 ml-1">({displayReviewCount} review{displayReviewCount === 1 ? "" : "s"})</span>
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
                                        <span className="font-bold text-dark">{displayReviewCount ? displayRating.toFixed(1) : "—"}</span>
                                        <span className="text-sm text-dark/40">({displayReviewCount} review{displayReviewCount === 1 ? "" : "s"})</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-5">
                                    {isAuthenticated && reviewEligibility?.canReview && (
                                        <div className="rounded-2xl border border-primary/10 bg-primary/5 p-5">
                                            <h4 className="font-display text-lg font-bold text-dark">Write a verified review</h4>
                                            <p className="mt-1 text-sm text-dark/55">You can review this item because it was delivered in one of your orders.</p>
                                            <div className="mt-4 grid gap-4 md:grid-cols-[220px_1fr]">
                                                <select
                                                    value={reviewForm.orderId}
                                                    onChange={(event) => setReviewForm((current) => ({ ...current, orderId: event.target.value }))}
                                                    className="h-11 rounded-xl border border-secondary/20 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-accent/20"
                                                >
                                                    {reviewEligibility.availableOrders.map((order) => (
                                                        <option key={order.id} value={order.id}>{order.orderNumber}</option>
                                                    ))}
                                                </select>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {[1, 2, 3, 4, 5].map((rating) => (
                                                        <button
                                                            key={rating}
                                                            type="button"
                                                            onClick={() => setReviewForm((current) => ({ ...current, rating }))}
                                                            className="rounded-full p-1"
                                                        >
                                                            <Star className={`h-5 w-5 ${rating <= reviewForm.rating ? "fill-yellow-400 text-yellow-400" : "text-secondary/20"}`} />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <textarea
                                                value={reviewForm.comment}
                                                onChange={(event) => setReviewForm((current) => ({ ...current, comment: event.target.value }))}
                                                placeholder="Share your experience with this product"
                                                className="mt-4 min-h-[120px] w-full rounded-2xl border border-secondary/20 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/20"
                                            />
                                            {(reviewError || reviewMessage) && (
                                                <div className={`mt-4 rounded-xl px-4 py-3 text-sm ${reviewError ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"}`}>
                                                    {reviewError ?? reviewMessage}
                                                </div>
                                            )}
                                            <div className="mt-4 flex justify-end">
                                                <Button className="rounded-xl" onClick={handleSubmitReview} disabled={reviewSubmitting}>
                                                    {reviewSubmitting ? "Submitting..." : "Submit Review"}
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {isAuthenticated && !reviewEligibility?.canReview && reviewEligibility?.hasReviewed && reviewEligibility.latestReview && (
                                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-sm text-emerald-700">
                                            You already reviewed this product{reviewEligibility.latestReview.isApproved ? "." : "; it is currently pending approval."}
                                        </div>
                                    )}

                                    {!isAuthenticated && (
                                        <div className="rounded-2xl border border-secondary/10 bg-secondary/5 p-5 text-sm text-dark/60">
                                            <Link href="/auth" className="font-bold text-accent hover:underline">Sign in</Link> after your delivered order to leave a verified review.
                                        </div>
                                    )}

                                    {reviewsLoading ? (
                                        <div className="rounded-2xl border border-secondary/10 bg-secondary/5 p-6 text-sm text-dark/40">Loading reviews...</div>
                                    ) : reviews.length === 0 ? (
                                        <div className="rounded-2xl border border-secondary/10 bg-secondary/5 p-6 text-sm text-dark/40">No approved reviews yet for this product.</div>
                                    ) : reviews.map((review) => (
                                        <div key={review.id} className="p-5 rounded-2xl bg-secondary/5 border border-secondary/10">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-full bg-accent/10 flex items-center justify-center">
                                                        <span className="text-xs font-bold text-accent">{review.customerName.charAt(0)}</span>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <p className="text-sm font-bold text-dark">{review.customerName}</p>
                                                            {review.isVerifiedPurchase && <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">Verified Purchase</span>}
                                                        </div>
                                                        <p className="text-xs text-dark/40">{new Date(review.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-0.5">
                                                    {Array.from({ length: 5 }).map((_, si) => (
                                                        <Star key={si} className={`h-3.5 w-3.5 ${si < review.rating ? "text-yellow-400 fill-current" : "text-secondary/20"}`} />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-sm text-dark/60 leading-relaxed">{review.comment}</p>
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
