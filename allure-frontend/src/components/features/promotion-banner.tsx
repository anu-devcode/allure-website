"use client";

import { Truck } from "lucide-react";
import { useStorefrontCms } from "@/components/providers/storefront-cms-provider";

export function PromotionBanner() {
    const { content } = useStorefrontCms();
    const banner = content.promotionBanner;

    if (!banner.enabled) {
        return null;
    }

    return (
        <div className="bg-accent py-3 text-white">
            <div className="container mx-auto px-4 flex items-center justify-center gap-3 text-center">
                <Truck className="h-5 w-5 animate-pulse" />
                <p className="text-sm font-medium tracking-wide">
                    <span className="font-bold">{banner.highlight}</span> {banner.text}
                </p>
            </div>
        </div>
    );
}
