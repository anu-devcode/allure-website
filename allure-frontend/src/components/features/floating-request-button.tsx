"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export function FloatingRequestButton() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    return (
        <Link
            href="/custom-preorder"
            className={cn(
                "fixed bottom-24 right-6 md:bottom-8 md:right-8 z-40 transition-all duration-500 flex items-center gap-3 bg-white border border-secondary/20 p-4 rounded-3xl shadow-2xl hover:scale-110 hover:-translate-y-2 active:scale-95 group overflow-hidden",
                isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"
            )}
        >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-white shadow-lg animate-pulse-slow">
                <Sparkles className="h-5 w-5" />
            </div>
            <div className="relative flex flex-col items-start pr-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-dark/40 leading-none mb-1">Preorder</span>
                <span className="text-sm font-bold text-dark leading-none">Order Anything</span>
            </div>
        </Link>
    );
}
