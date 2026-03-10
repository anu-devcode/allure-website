"use client";

import Link from "next/link";
import { ShoppingBag, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlobalSearch } from "@/components/features/global-search";
import { AccountDropdown } from "@/components/features/account-dropdown";
import { usePathname } from "next/navigation";

const navLinks = [
    { name: "Home", href: "/" },
    { name: "Product", href: "/catalog" },
    { name: "Order Us", href: "/custom-preorder" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
];

import { useCartStore } from "@/store/useCartStore";
import { useEffect, useState } from "react";

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [badgePulse, setBadgePulse] = useState(false);
    const pathname = usePathname();
    const itemCount = useCartStore((state) => state.getItemCount());

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (!isMenuOpen) {
            return;
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsMenuOpen(false);
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isMenuOpen]);

    useEffect(() => {
        if (!mounted || itemCount <= 0) {
            return;
        }

        setBadgePulse(true);
        const timeout = window.setTimeout(() => setBadgePulse(false), 280);
        return () => window.clearTimeout(timeout);
    }, [itemCount, mounted]);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-secondary/20 bg-white/95 backdrop-blur-sm supports-[backdrop-filter]:bg-white/80">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <Link href="/" className="group flex items-center gap-2.5 rounded-lg px-1 py-1 transition-transform duration-200 hover:scale-[1.01] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30">
                    <span className="relative inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-accent/35 bg-cream shadow-[0_3px_12px_rgba(79,111,82,0.14)] transition-all duration-300 group-hover:border-accent/55 group-hover:shadow-[0_5px_16px_rgba(79,111,82,0.2)]">
                        <span className="bg-gradient-to-b from-accent to-dark bg-clip-text font-display text-sm font-bold tracking-[0.08em] text-transparent">A</span>
                    </span>
                    <span className="flex flex-col leading-none">
                        <span className="bg-gradient-to-r from-accent via-accent to-dark bg-clip-text font-display text-[1.45rem] font-extrabold uppercase tracking-[0.08em] text-transparent transition-all duration-300 group-hover:tracking-[0.1em]">
                            Allure
                        </span>
                        <span className="hidden pt-0.5 text-[9px] font-semibold uppercase tracking-[0.28em] text-dark/45 sm:block">
                            Online Shopping
                        </span>
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex md:items-center md:gap-8">
                    {navLinks.map((link) => (
                        <Link key={link.name} href={link.href} className="group relative py-2 text-sm font-medium text-dark/70 transition-colors duration-300 hover:text-accent focus-visible:outline-none focus-visible:text-accent">
                            {link.name}
                            <span
                                aria-hidden
                                className={`absolute -bottom-[3px] left-0 h-0.5 w-full origin-left rounded-full bg-accent transition-transform duration-300 motion-reduce:transition-none ${pathname === link.href ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100 group-focus-visible:scale-x-100"}`}
                            />
                        </Link>
                    ))}
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-1 sm:gap-2">
                    <GlobalSearch />
                    <AccountDropdown />
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Open cart"
                        className="group relative transition-transform duration-200 hover:scale-105 motion-reduce:transform-none"
                        onClick={() => useCartStore.getState().setCartOpen(true)}
                    >
                        <ShoppingBag className="h-5 w-5 transition-transform duration-200 group-hover:scale-110 motion-reduce:transform-none" />
                        {mounted && itemCount > 0 && (
                            <span className={`absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-dark motion-safe:animate-pulse-slow ${badgePulse ? "motion-safe:animate-cart-badge-pop" : ""}`}>
                                {itemCount}
                            </span>
                        )}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={isMenuOpen}
                        aria-controls="mobile-nav"
                        className="group transition-transform duration-200 hover:scale-105 motion-reduce:transform-none md:hidden"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <span className="relative inline-flex h-6 w-6 items-center justify-center">
                            <Menu className={`absolute h-6 w-6 transition-all duration-300 motion-reduce:transition-none ${isMenuOpen ? "scale-75 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"}`} />
                            <X className={`absolute h-6 w-6 transition-all duration-300 motion-reduce:transition-none ${isMenuOpen ? "scale-100 rotate-0 opacity-100" : "scale-75 -rotate-90 opacity-0"}`} />
                        </span>
                    </Button>
                </div>
            </div>

            {/* Mobile Navigation */}
            <div
                aria-hidden={!isMenuOpen}
                className={`grid transition-all duration-300 ease-out motion-reduce:transition-none md:hidden ${isMenuOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
            >
                <div className="overflow-hidden">
                    <nav
                        id="mobile-nav"
                        className={`mx-3 mb-3 flex flex-col gap-1 rounded-2xl border border-secondary/15 bg-white p-2 shadow-sm transition-transform duration-300 ease-out motion-reduce:transition-none ${isMenuOpen ? "translate-y-0" : "-translate-y-2"}`}
                    >
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`group relative flex items-center justify-between overflow-hidden rounded-xl px-3 py-3 text-base font-medium transition-all duration-300 ${pathname === link.href ? "bg-secondary/40 text-accent shadow-sm" : "text-dark/70 hover:bg-secondary/25 hover:text-accent"}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <span className="relative z-10">{link.name}</span>
                                <span
                                    aria-hidden
                                    className={`pointer-events-none absolute inset-y-1 left-1 w-1 rounded-full bg-accent/70 transition-transform duration-300 ${pathname === link.href ? "scale-y-100" : "scale-y-0 group-hover:scale-y-100"}`}
                                />
                                <span
                                    aria-hidden
                                    className={`relative z-10 h-1.5 w-1.5 rounded-full bg-accent transition-transform duration-300 ${pathname === link.href ? "scale-100" : "scale-0 group-hover:scale-100"}`}
                                />
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>
        </header>
    );
}
