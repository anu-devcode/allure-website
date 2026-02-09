import { Truck } from "lucide-react";

export function PromotionBanner() {
    return (
        <div className="bg-accent py-3 text-white">
            <div className="container mx-auto px-4 flex items-center justify-center gap-3 text-center">
                <Truck className="h-5 w-5 animate-pulse" />
                <p className="text-sm font-medium tracking-wide">
                    <span className="font-bold">Free Delivery</span> in Addis Ababa! 🇪🇹 | Limited time offer
                </p>
            </div>
        </div>
    );
}
