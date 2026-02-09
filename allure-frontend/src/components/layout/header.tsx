"use client";

import Link from "next/link";
import { ShoppingBag, Search, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
    { name: "Home", href: "/" },
    { name: "Catalog", href: "/catalog" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
];

import { useCartStore } from "@/store/useCartStore";

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const itemCount = useCartStore((state) => state.getItemCount());

    return (
        <header className="sticky top-0 z-50 w-full border-b border-secondary/20 bg-background/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <span className="font-display text-2xl font-bold tracking-tight text-accent">
                        Allure
                    </span>
                    <span className="hidden text-sm font-medium text-dark/60 sm:inline-block">
                        Online Shopping
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex md:items-center md:gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-sm font-medium text-dark/70 transition-colors hover:text-accent"
                        >
                            {link.name}
                        </Link>
                    ))}
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="hidden sm:flex">
                        <Search className="h-5 w-5" />
                    </Button>
                    <Link href="/cart">
                        <Button variant="ghost" size="icon" className="relative">
                            <ShoppingBag className="h-5 w-5" />
                            {itemCount > 0 && (
                                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-dark">
                                    {itemCount}
                                </span>
                            )}
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </Button>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <div className="animate-in slide-in-from-top-4 md:hidden">
                    <nav className="flex flex-col border-t border-secondary/10 bg-background p-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="py-3 text-base font-medium text-dark/70"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>
                </div>
            )}
        </header>
    );
}
