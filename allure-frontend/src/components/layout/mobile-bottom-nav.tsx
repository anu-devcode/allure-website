"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid, ShoppingBag, User, Sparkles } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Catalog", href: "/catalog", icon: Grid },
    { name: "Order Us", href: "/custom-preorder", icon: Sparkles },
    { name: "Cart", href: "/cart", icon: ShoppingBag, isCart: true },
    { name: "Account", href: "/account", icon: User },
];

export function MobileBottomNav() {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);
    const itemCount = useCartStore((state) => state.getItemCount());

    useEffect(() => {
        setMounted(true);
    }, []);

    // Hide bottom nav on specific pages if needed (e.g., checkout)
    if (pathname === "/checkout" || pathname === "/admin/login") return null;

    return (
        <div className="fixed bottom-0 left-0 z-50 w-full md:hidden">
            <div className="flex h-20 items-center justify-around border-t border-secondary/20 bg-white px-2 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] rounded-t-[2.5rem]">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "relative flex flex-col items-center gap-1 transition-all duration-300",
                                isActive ? "text-accent scale-110" : "text-dark/40"
                            )}
                        >
                            <div className={cn(
                                "flex h-10 w-10 items-center justify-center rounded-xl transition-all",
                                isActive ? "bg-accent/10" : ""
                            )}>
                                <Icon className="h-5 w-5" />
                            </div>

                            {item.isCart && mounted && itemCount > 0 && (
                                <span className="absolute -right-0 -top-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-dark animate-in zoom-in duration-300">
                                    {itemCount}
                                </span>
                            )}

                            {isActive && (
                                <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-accent" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
