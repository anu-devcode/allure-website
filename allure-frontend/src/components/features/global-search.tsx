"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, ArrowRight, ShoppingBag, FileText, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { MOCK_PRODUCTS } from "@/data/mock-products";
import { Product } from "@/types";

// Static pages that are searchable
const SITE_PAGES = [
    { name: "Home", href: "/", keywords: ["home", "main", "landing", "welcome"] },
    { name: "Catalog", href: "/catalog", keywords: ["catalog", "shop", "browse", "products", "all", "collection", "store"] },
    { name: "Custom Preorder", href: "/custom-preorder", keywords: ["custom", "preorder", "order", "request", "shein", "source", "import"] },
    { name: "About Us", href: "/about", keywords: ["about", "story", "team", "who", "company", "allure"] },
    { name: "Contact Us", href: "/contact", keywords: ["contact", "help", "support", "phone", "telegram", "message", "reach"] },
    { name: "Shopping Cart", href: "/cart", keywords: ["cart", "basket", "checkout", "bag", "order"] },
    { name: "Checkout", href: "/checkout", keywords: ["checkout", "pay", "payment", "complete", "finish"] },
    { name: "Rules & Policies", href: "/rules", keywords: ["rules", "policy", "return", "refund", "terms", "conditions"] },
    { name: "Terms of Service", href: "/terms", keywords: ["terms", "service", "legal", "agreement"] },
    { name: "My Account", href: "/account", keywords: ["account", "profile", "settings", "my", "dashboard"] },
    { name: "Sign In", href: "/auth", keywords: ["sign", "login", "register", "create", "account", "auth"] },
];

interface GlobalSearchProps {
    onClose?: () => void;
}

export function GlobalSearch({ onClose }: GlobalSearchProps) {
    const [query, setQuery] = useState("");
    const [isExpanded, setIsExpanded] = useState(false);
    const [productResults, setProductResults] = useState<Product[]>([]);
    const [pageResults, setPageResults] = useState<typeof SITE_PAGES>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const toggleSearch = useCallback(() => {
        if (isExpanded) {
            setIsExpanded(false);
            setQuery("");
            setProductResults([]);
            setPageResults([]);
        } else {
            setIsExpanded(true);
            setTimeout(() => inputRef.current?.focus(), 150);
        }
    }, [isExpanded]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                if (isExpanded) toggleSearch();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isExpanded, toggleSearch]);

    // Close on Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isExpanded) toggleSearch();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isExpanded, toggleSearch]);

    // Search logic
    useEffect(() => {
        if (!query.trim()) {
            setProductResults([]);
            setPageResults([]);
            return;
        }

        const searchLower = query.toLowerCase().trim();

        // Search products
        const matchedProducts = MOCK_PRODUCTS.filter(
            (p) =>
                p.name.toLowerCase().includes(searchLower) ||
                p.description.toLowerCase().includes(searchLower) ||
                p.category.toLowerCase().includes(searchLower) ||
                p.origin?.toLowerCase().includes(searchLower)
        ).slice(0, 4);

        // Search pages
        const matchedPages = SITE_PAGES.filter(
            (page) =>
                page.name.toLowerCase().includes(searchLower) ||
                page.keywords.some((kw) => kw.includes(searchLower))
        ).slice(0, 3);

        setProductResults(matchedProducts);
        setPageResults(matchedPages);
    }, [query]);

    const handleProductClick = (productId: string) => {
        toggleSearch();
        router.push(`/product/${productId}`);
    };

    const handlePageClick = () => {
        toggleSearch();
    };

    const hasResults = productResults.length > 0 || pageResults.length > 0;
    const hasQuery = query.trim().length > 0;

    return (
        <div ref={containerRef} className="relative flex items-center">
            {/* Expanded Search Field */}
            <div
                className={cn(
                    "absolute right-0 top-1/2 -translate-y-1/2 flex items-center transition-all duration-300 ease-out origin-right",
                    isExpanded
                        ? "w-[280px] sm:w-[320px] md:w-[400px] opacity-100 scale-x-100"
                        : "w-0 opacity-0 scale-x-0 pointer-events-none"
                )}
            >
                <div className="relative w-full">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-dark/30">
                        <Search className="h-4 w-4" />
                    </div>
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search products, pages..."
                        className="h-10 w-full rounded-full border-2 border-accent/20 bg-white pl-10 pr-10 text-sm text-dark placeholder:text-dark/30 focus:border-accent focus:outline-none shadow-lg shadow-accent/5 transition-all"
                    />
                    {hasQuery && (
                        <button
                            onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-dark/30 hover:text-dark/60 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Search Icon Button */}
            <button
                onClick={toggleSearch}
                className={cn(
                    "relative z-10 flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200",
                    isExpanded
                        ? "bg-accent text-white shadow-md"
                        : "text-dark/70 hover:bg-secondary/10 hover:text-accent"
                )}
                aria-label={isExpanded ? "Close search" : "Open search"}
            >
                {isExpanded ? <X className="h-4 w-4" /> : <Search className="h-5 w-5" />}
            </button>

            {/* Search Results Dropdown */}
            {isExpanded && hasQuery && (
                <div className="absolute right-0 top-full mt-2 w-[280px] sm:w-[320px] md:w-[400px] rounded-2xl bg-white border border-secondary/10 shadow-2xl shadow-dark/10 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {hasResults ? (
                        <div className="max-h-[70vh] overflow-y-auto">
                            {/* Product Results */}
                            {productResults.length > 0 && (
                                <div className="p-3">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/30 px-2 mb-2">Products</p>
                                    <div className="flex flex-col gap-1">
                                        {productResults.map((product) => (
                                            <button
                                                key={product.id}
                                                onClick={() => handleProductClick(product.id)}
                                                className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-secondary/5 transition-colors text-left group"
                                            >
                                                <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-secondary/10 flex-shrink-0">
                                                    <Image src={product.image} alt={product.name} fill className="object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-dark truncate">{product.name}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-xs font-bold text-accent">{product.price.toLocaleString()} ETB</span>
                                                        <span className="text-[10px] text-dark/40">•</span>
                                                        <span className="text-[10px] text-dark/40">{product.category}</span>
                                                    </div>
                                                </div>
                                                <ArrowRight className="h-4 w-4 text-dark/20 group-hover:text-accent transition-colors flex-shrink-0" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Divider */}
                            {productResults.length > 0 && pageResults.length > 0 && (
                                <div className="mx-4 border-t border-secondary/10" />
                            )}

                            {/* Page Results */}
                            {pageResults.length > 0 && (
                                <div className="p-3">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/30 px-2 mb-2">Pages</p>
                                    <div className="flex flex-col gap-1">
                                        {pageResults.map((page) => (
                                            <Link
                                                key={page.href}
                                                href={page.href}
                                                onClick={handlePageClick}
                                                className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-secondary/5 transition-colors group"
                                            >
                                                <div className="h-10 w-10 rounded-xl bg-accent/5 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/10 transition-colors">
                                                    <FileText className="h-4 w-4 text-accent/50" />
                                                </div>
                                                <span className="text-sm font-medium text-dark">{page.name}</span>
                                                <ArrowRight className="h-4 w-4 text-dark/20 group-hover:text-accent transition-colors ml-auto flex-shrink-0" />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* View All */}
                            {productResults.length > 0 && (
                                <div className="p-3 border-t border-secondary/10">
                                    <Link
                                        href={`/catalog?search=${encodeURIComponent(query)}`}
                                        onClick={handlePageClick}
                                        className="flex items-center justify-center gap-2 w-full p-2.5 rounded-xl bg-accent/5 hover:bg-accent/10 text-accent text-sm font-bold transition-colors"
                                    >
                                        <ShoppingBag className="h-4 w-4" />
                                        View all in Catalog
                                    </Link>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <div className="h-12 w-12 rounded-full bg-secondary/5 flex items-center justify-center mx-auto mb-3">
                                <Search className="h-5 w-5 text-dark/20" />
                            </div>
                            <p className="text-sm font-bold text-dark/40">No results found</p>
                            <p className="text-xs text-dark/30 mt-1">Try a different search term</p>
                        </div>
                    )}
                </div>
            )}

            {/* Quick Search Suggestions (when expanded but no query) */}
            {isExpanded && !hasQuery && (
                <div className="absolute right-0 top-full mt-2 w-[280px] sm:w-[320px] md:w-[400px] rounded-2xl bg-white border border-secondary/10 shadow-2xl shadow-dark/10 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/30 mb-3">Quick Links</p>
                        <div className="flex flex-wrap gap-2">
                            {["Dresses", "Outerwear", "Accessories", "Pre-Order", "SHEIN"].map((tag) => (
                                <button
                                    key={tag}
                                    onClick={() => setQuery(tag)}
                                    className="px-3 py-1.5 rounded-full bg-secondary/5 border border-secondary/10 text-xs font-bold text-dark/50 hover:bg-accent/5 hover:border-accent/20 hover:text-accent transition-all"
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
