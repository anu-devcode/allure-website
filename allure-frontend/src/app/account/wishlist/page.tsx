"use client";

import { Heart } from "lucide-react";

export default function WishlistPage() {
    return (
        <div className="animate-slide-up-fade">
            <div className="mb-8">
                <h1 className="font-display text-2xl font-bold text-dark tracking-tight md:text-3xl">Wishlist</h1>
                <p className="text-sm text-dark/50 mt-1">Items you've saved for later.</p>
            </div>

            <div className="rounded-[2rem] bg-white p-12 border border-secondary/10 shadow-sm text-center">
                <div className="h-16 w-16 rounded-full bg-secondary/5 flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-7 w-7 text-dark/20" />
                </div>
                <h3 className="font-display text-lg font-bold text-dark/40 mb-1">No saved items</h3>
                <p className="text-sm text-dark/30 max-w-xs mx-auto">Browse the catalog and tap the heart icon to save items here.</p>
            </div>
        </div>
    );
}
