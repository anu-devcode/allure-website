"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/store/useAdminAuth";
import { AdminReview, adminReviewService } from "@/services/adminReviewService";
import { Check, Star, Trash2, X } from "lucide-react";

export default function AdminReviewsPage() {
    const token = useAdminAuth((state) => state.token);
    const [reviews, setReviews] = useState<AdminReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");

    useEffect(() => {
        const load = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const data = await adminReviewService.getReviews(token);
                setReviews(data);
            } catch {
                setReviews([]);
            } finally {
                setLoading(false);
            }
        };

        void load();
    }, [token]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return reviews;
        return reviews.filter((review) =>
            review.customerName.toLowerCase().includes(q) ||
            review.comment.toLowerCase().includes(q) ||
            (review.productName ?? "").toLowerCase().includes(q)
        );
    }, [reviews, query]);

    const toggleApproval = async (review: AdminReview) => {
        if (!token) return;
        try {
            const updated = await adminReviewService.updateReview(token, review.id, { isApproved: !review.isApproved });
            setReviews((current) => current.map((item) => (item.id === review.id ? updated : item)));
        } catch {
            return;
        }
    };

    const handleDelete = async (id: string) => {
        if (!token || !confirm("Delete this review?")) return;
        try {
            await adminReviewService.deleteReview(token, id);
            setReviews((current) => current.filter((review) => review.id !== id));
        } catch {
            return;
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-display text-3xl font-bold text-dark">Reviews</h1>
                <p className="text-dark/60">Approve, moderate, and remove customer reviews.</p>
            </div>

            <div className="rounded-3xl border border-secondary/10 bg-white p-4 shadow-sm">
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search reviews"
                    className="h-11 w-full rounded-xl border border-secondary/20 px-4 text-sm outline-none"
                />
            </div>

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="rounded-3xl border border-secondary/10 bg-white p-8 text-center text-sm text-dark/40">Loading reviews...</div>
                ) : filtered.length === 0 ? (
                    <div className="rounded-3xl border border-secondary/10 bg-white p-8 text-center text-sm text-dark/40">No reviews found.</div>
                ) : filtered.map((review) => (
                    <div key={review.id} className="rounded-3xl border border-secondary/10 bg-white p-6 shadow-sm">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-bold text-dark">{review.customerName}</h3>
                                    <span className="text-xs text-dark/40">{new Date(review.createdAt).toLocaleString()}</span>
                                    <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${review.isApproved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                                        {review.isApproved ? "Approved" : "Pending"}
                                    </span>
                                </div>
                                <p className="mt-2 text-sm text-dark/70">{review.comment}</p>
                                <div className="mt-3 flex items-center gap-2">
                                    <div className="flex items-center gap-1 text-yellow-500">
                                        {Array.from({ length: review.rating }).map((_, index) => (
                                            <Star key={`${review.id}-${index}`} className="h-4 w-4 fill-current" />
                                        ))}
                                    </div>
                                    {review.productName ? <span className="text-xs text-dark/40">for {review.productName}</span> : null}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" className="rounded-xl" onClick={() => void toggleApproval(review)}>
                                    {review.isApproved ? <X className="mr-1 h-4 w-4" /> : <Check className="mr-1 h-4 w-4" />}
                                    {review.isApproved ? "Unapprove" : "Approve"}
                                </Button>
                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-red-500" onClick={() => void handleDelete(review.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
