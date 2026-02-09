"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { MOCK_PRODUCTS } from "@/data/mock-products";
import { ProductCard } from "@/components/features/product-card";
import { CatalogFilters } from "@/components/features/catalog-filters";
import { Badge } from "@/components/ui/badge";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function CatalogContent() {
    const searchParams = useSearchParams();

    const category = searchParams.get("category");
    const availability = searchParams.get("availability");

    const filteredProducts = useMemo(() => {
        return MOCK_PRODUCTS.filter((product) => {
            const matchesCategory = !category || category === "All" || product.category === category;
            const matchesAvailability = !availability || availability === "All" || product.availability === availability;
            return matchesCategory && matchesAvailability;
        });
    }, [category, availability]);

    return (
        <div className="flex flex-col gap-8">
            {/* Header Info */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="font-display text-4xl font-bold text-dark">Our Catalog</h1>
                    <p className="mt-1 text-dark/60">Showing {filteredProducts.length} results</p>
                </div>
                <div className="flex items-center gap-2">
                    {category && <Badge variant="secondary" className="px-3 py-1">{category}</Badge>}
                    {availability && <Badge variant="outline" className="px-3 py-1">{availability}</Badge>}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
                {/* Sidebar Filters */}
                <aside className="hidden lg:block">
                    <div className="sticky top-24">
                        <CatalogFilters />
                    </div>
                </aside>

                {/* Mobile Filter Button */}
                <div className="flex lg:hidden overflow-x-auto py-2 gap-2 scrollbar-hide">
                    {/* Simple mobile scroll view for categories could go here, or a drawer */}
                    <Button variant="outline" className="rounded-full gap-2 shrink-0">
                        <SlidersHorizontal className="h-4 w-4" /> Filters
                    </Button>
                </div>

                {/* Product Grid */}
                <div className="lg:col-span-3">
                    {filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
                            {filteredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-secondary/20 p-12 text-center">
                            <div className="text-4xl mb-4">🔍</div>
                            <h3 className="font-display text-xl font-bold text-dark">No products found</h3>
                            <p className="text-dark/60">Try adjusting your filters or search terms.</p>
                        </div>
                    )}

                    {/* Pagination Placeholder */}
                    {filteredProducts.length > 0 && (
                        <div className="mt-16 flex items-center justify-center gap-2">
                            <Button variant="outline" disabled className="rounded-xl">Previous</Button>
                            <Button className="rounded-xl h-10 w-10 p-0" variant="primary">1</Button>
                            <Button variant="outline" className="rounded-xl h-10 w-10 p-0 hover:bg-secondary/20">2</Button>
                            <Button variant="outline" className="rounded-xl">Next</Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Custom Request Banner */}
            <div className="mt-24 rounded-4xl bg-accent p-12 text-center text-white shadow-2xl shadow-accent/20 overflow-hidden relative group">
                <div className="absolute top-0 left-0 w-full h-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <div className="relative z-10 flex flex-col items-center gap-6">
                    <h2 className="font-display text-4xl font-bold">Didn't find what you're looking for?</h2>
                    <p className="max-w-xl text-lg text-white/80">
                        We can special-order almost anything from SHEIN or Turkey.
                        Just send us the link or photo and we'll handle the rest.
                    </p>
                    <Link href="/custom-preorder">
                        <Button size="lg" className="bg-white text-accent hover:bg-cream px-12 rounded-full border-none shadow-xl transform transition hover:-translate-y-1">
                            Request Custom Item
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function CatalogPage() {
    return (
        <div className="container mx-auto px-4 py-16 sm:py-24">
            <Suspense fallback={<div>Loading catalog...</div>}>
                <CatalogContent />
            </Suspense>
        </div>
    );
}
