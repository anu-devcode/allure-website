"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/store/useAdminAuth";
import { ADMIN_REVIEW_AUTH_EXPIRED_ERROR, AdminReview, adminReviewService } from "@/services/adminReviewService";
import { Check, RefreshCw, Search, ShieldCheck, Star, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AdminReviewsPage() {
    const token = useAdminAuth((state) => state.token);
    const logout = useAdminAuth((state) => state.logout);
    const router = useRouter();
    const [reviews, setReviews] = useState<AdminReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [statusFilter, setStatusFilter] = useState<"All" | "Approved" | "Pending">("All");
    const [purchaseFilter, setPurchaseFilter] = useState<"All" | "Verified" | "Unverified">("All");
    const [savingId, setSavingId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [drafts, setDrafts] = useState<Record<string, { comment: string; rating: number; isApproved: boolean }>>({});
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async (showRefreshingState = false) => {
        if (!token) {
            setReviews([]);
            setLoading(false);
            return;
        }

        if (showRefreshingState) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            setError(null);
            const data = await adminReviewService.getReviews(token);
            setReviews(data);
        } catch (error) {
            if (error instanceof Error && error.message === ADMIN_REVIEW_AUTH_EXPIRED_ERROR) {
                logout();
                router.push("/admin/login");
                return;
            }

            setReviews([]);
            setError("Could not load reviews right now.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [logout, router, token]);

    useEffect(() => {
        void load();
    }, [load]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return reviews.filter((review) => {
            const matchesQuery = !q || [
                review.customerName,
                review.comment,
                review.productName ?? "",
                review.orderNumber ?? "",
                review.customerEmail ?? "",
            ].some((value) => value.toLowerCase().includes(q));

            const matchesStatus = statusFilter === "All" || (statusFilter === "Approved" ? review.isApproved : !review.isApproved);
            const matchesPurchase = purchaseFilter === "All" || (purchaseFilter === "Verified" ? review.isVerifiedPurchase : !review.isVerifiedPurchase);

            return matchesQuery && matchesStatus && matchesPurchase;
        });
    }, [purchaseFilter, query, reviews, statusFilter]);

    const stats = useMemo(() => ({
        total: reviews.length,
        approved: reviews.filter((review) => review.isApproved).length,
        pending: reviews.filter((review) => !review.isApproved).length,
        verified: reviews.filter((review) => review.isVerifiedPurchase).length,
    }), [reviews]);

    const getDraft = (review: AdminReview) => drafts[review.id] ?? {
        comment: review.comment,
        rating: review.rating,
        isApproved: review.isApproved,
    };

    const toggleApproval = async (review: AdminReview) => {
        if (!token) return;
        try {
            setSavingId(review.id);
            const updated = await adminReviewService.updateReview(token, review.id, { isApproved: !review.isApproved });
            setReviews((current) => current.map((item) => (item.id === review.id ? updated : item)));
            setDrafts((current) => {
                const next = { ...current };
                delete next[review.id];
                return next;
            });
        } catch (error) {
            if (error instanceof Error && error.message === ADMIN_REVIEW_AUTH_EXPIRED_ERROR) {
                logout();
                router.push("/admin/login");
                return;
            }

            setError("Could not update that review right now.");
        } finally {
            setSavingId(null);
        }
    };

    const saveDraft = async (review: AdminReview) => {
        if (!token) return;
        const draft = getDraft(review);

        try {
            setSavingId(review.id);
            const updated = await adminReviewService.updateReview(token, review.id, {
                comment: draft.comment,
                rating: draft.rating,
                isApproved: draft.isApproved,
            });
            setReviews((current) => current.map((item) => (item.id === review.id ? updated : item)));
            setEditingId(null);
            setDrafts((current) => {
                const next = { ...current };
                delete next[review.id];
                return next;
            });
            setError(null);
        } catch (error) {
            if (error instanceof Error && error.message === ADMIN_REVIEW_AUTH_EXPIRED_ERROR) {
                logout();
                router.push("/admin/login");
                return;
            }

            setError("Could not save review changes right now.");
        } finally {
            setSavingId(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!token || !confirm("Delete this review?")) return;
        try {
            await adminReviewService.deleteReview(token, id);
            setReviews((current) => current.filter((review) => review.id !== id));
        } catch (error) {
            if (error instanceof Error && error.message === ADMIN_REVIEW_AUTH_EXPIRED_ERROR) {
                logout();
                router.push("/admin/login");
                return;
            }

            setError("Could not delete that review right now.");
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="font-display text-3xl font-bold text-dark">Reviews</h1>
                    <p className="text-dark/60">Approve, moderate, and manage storefront review trust.</p>
                </div>
                <Button variant="outline" className="rounded-xl gap-2" onClick={() => void load(true)} disabled={loading || refreshing}>
                    <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} /> Refresh
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-3xl border border-secondary/10 bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-widest text-dark/40">Total</p><p className="mt-2 font-display text-3xl font-bold text-dark">{stats.total}</p></div>
                <div className="rounded-3xl border border-secondary/10 bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-widest text-dark/40">Approved</p><p className="mt-2 font-display text-3xl font-bold text-dark">{stats.approved}</p></div>
                <div className="rounded-3xl border border-secondary/10 bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-widest text-dark/40">Pending</p><p className="mt-2 font-display text-3xl font-bold text-dark">{stats.pending}</p></div>
                <div className="rounded-3xl border border-secondary/10 bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-widest text-dark/40">Verified Purchase</p><p className="mt-2 font-display text-3xl font-bold text-dark">{stats.verified}</p></div>
            </div>

            <div className="flex flex-col gap-4 rounded-3xl border border-secondary/10 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="relative w-full lg:max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark/40" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by customer, product, order, email, comment"
                            className="h-11 w-full rounded-xl border border-secondary/20 bg-secondary/5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-accent/20"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {(["All", "Approved", "Pending"] as const).map((option) => (
                            <button key={option} type="button" onClick={() => setStatusFilter(option)} className={cn("rounded-full px-4 py-1.5 text-xs font-bold transition-colors", statusFilter === option ? "bg-primary text-dark" : "bg-secondary/5 text-dark/50 hover:text-dark")}>{option}</button>
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {(["All", "Verified", "Unverified"] as const).map((option) => (
                            <button key={option} type="button" onClick={() => setPurchaseFilter(option)} className={cn("rounded-full px-4 py-1.5 text-xs font-bold transition-colors", purchaseFilter === option ? "bg-primary text-dark" : "bg-secondary/5 text-dark/50 hover:text-dark")}>{option}</button>
                        ))}
                    </div>
                </div>

                {error && <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</div>}
            </div>

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="rounded-3xl border border-secondary/10 bg-white p-8 text-center text-sm text-dark/40">Loading reviews...</div>
                ) : filtered.length === 0 ? (
                    <div className="rounded-3xl border border-secondary/10 bg-white p-8 text-center text-sm text-dark/40">No reviews found.</div>
                ) : filtered.map((review) => (
                    <div key={review.id} className="rounded-3xl border border-secondary/10 bg-white p-6 shadow-sm">
                        {(() => {
                            const isEditing = editingId === review.id;
                            const draft = getDraft(review);
                            return (
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h3 className="font-bold text-dark">{review.customerName}</h3>
                                    <span className="text-xs text-dark/40">{new Date(review.createdAt).toLocaleString()}</span>
                                    <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${review.isApproved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                                        {review.isApproved ? "Approved" : "Pending"}
                                    </span>
                                    {review.isVerifiedPurchase && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-accent">
                                            <ShieldCheck className="h-3 w-3" /> Verified
                                        </span>
                                    )}
                                </div>
                                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-dark/45">
                                    {review.customerEmail && <span>{review.customerEmail}</span>}
                                    {review.productName && review.productSlug && <Link href={`/product/${review.productId}`} className="font-semibold text-accent hover:underline">{review.productName}</Link>}
                                    {review.orderNumber && <span>Order {review.orderNumber}</span>}
                                </div>
                                {isEditing ? (
                                    <div className="mt-4 space-y-3">
                                        <div className="flex items-center gap-2">
                                            {[1, 2, 3, 4, 5].map((rating) => (
                                                <button key={rating} type="button" onClick={() => setDrafts((current) => ({ ...current, [review.id]: { ...draft, rating } }))} className="rounded-full p-1">
                                                    <Star className={`h-5 w-5 ${rating <= draft.rating ? "fill-yellow-400 text-yellow-400" : "text-secondary/20"}`} />
                                                </button>
                                            ))}
                                        </div>
                                        <textarea
                                            value={draft.comment}
                                            onChange={(event) => setDrafts((current) => ({ ...current, [review.id]: { ...draft, comment: event.target.value } }))}
                                            className="min-h-[110px] w-full rounded-2xl border border-secondary/20 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/20"
                                        />
                                        <label className="inline-flex items-center gap-2 text-sm text-dark/60">
                                            <input
                                                type="checkbox"
                                                checked={draft.isApproved}
                                                onChange={(event) => setDrafts((current) => ({ ...current, [review.id]: { ...draft, isApproved: event.target.checked } }))}
                                            />
                                            Approved for storefront
                                        </label>
                                    </div>
                                ) : (
                                    <p className="mt-3 text-sm text-dark/70">{review.comment}</p>
                                )}
                                <div className="mt-3 flex items-center gap-2">
                                    <div className="flex items-center gap-1 text-yellow-500">
                                        {Array.from({ length: isEditing ? draft.rating : review.rating }).map((_, index) => (
                                            <Star key={`${review.id}-${index}`} className="h-4 w-4 fill-current" />
                                        ))}
                                    </div>
                                    {review.productName ? <span className="text-xs text-dark/40">for {review.productName}</span> : null}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {isEditing ? (
                                    <>
                                        <Button variant="outline" size="sm" className="rounded-xl" onClick={() => void saveDraft(review)} disabled={savingId === review.id}>Save</Button>
                                        <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => { setEditingId(null); setDrafts((current) => { const next = { ...current }; delete next[review.id]; return next; }); }}>Cancel</Button>
                                    </>
                                ) : (
                                    <Button variant="outline" size="sm" className="rounded-xl" onClick={() => { setEditingId(review.id); setDrafts((current) => ({ ...current, [review.id]: getDraft(review) })); }}>
                                        Edit
                                    </Button>
                                )}
                                <Button variant="outline" size="sm" className="rounded-xl" onClick={() => void toggleApproval(review)} disabled={savingId === review.id}>
                                    {review.isApproved ? <X className="mr-1 h-4 w-4" /> : <Check className="mr-1 h-4 w-4" />}
                                    {review.isApproved ? "Unapprove" : "Approve"}
                                </Button>
                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-red-500" onClick={() => void handleDelete(review.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                            );
                        })()}
                    </div>
                ))}
            </div>
        </div>
    );
}
