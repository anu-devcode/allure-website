"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useCallback, useMemo, useState } from "react";

const availabilityTypes = ["All", "In-Store", "Pre-Order"];

interface CatalogFiltersProps {
    categories: string[];
    compact?: boolean;
}

export function CatalogFilters({ categories, compact = false }: CatalogFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentCategory = searchParams.get("category") || "All";
    const currentAvailability = searchParams.get("availability") || "All";
    const currentSearch = searchParams.get("search") || "";
    const [searchValue, setSearchValue] = useState(currentSearch);

    const categoryOptions = useMemo(() => ["All", ...categories], [categories]);

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value === "All" || value.trim() === "") {
                params.delete(name);
            } else {
                params.set(name, value);
            }
            return params.toString();
        },
        [searchParams]
    );

    const handleFilter = (name: string, value: string) => {
        router.push(`/catalog?${createQueryString(name, value)}`, { scroll: false });
    };

    const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        router.push(`/catalog?${createQueryString("search", searchValue)}`, { scroll: false });
    };

    const clearFilters = () => {
        setSearchValue("");
        router.push("/catalog");
    };

    const isFiltered = searchParams.toString() !== "";

    return (
        <div className={`flex flex-col ${compact ? "gap-6" : "gap-8"}`}>
            {/* Category Section */}
            <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-dark mb-4">Categories</h3>
                <div className="flex flex-wrap gap-2">
                    {categoryOptions.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => handleFilter("category", cat)}
                            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${currentCategory === cat
                                    ? "bg-accent text-white"
                                    : "bg-white text-dark/60 hover:bg-secondary/20 border border-secondary/20"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Availability Section */}
            <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-dark mb-4">Availability</h3>
                <div className="flex flex-col gap-2">
                    {availabilityTypes.map((type) => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="radio"
                                name="availability"
                                checked={currentAvailability === type}
                                onChange={() => handleFilter("availability", type)}
                                className="h-4 w-4 accent-accent"
                            />
                            <span className={`text-sm transition-colors ${currentAvailability === type ? "text-accent font-medium" : "text-dark/60 group-hover:text-dark"
                                }`}>
                                {type}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Search Input Mock */}
            <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark/40" />
                <input
                    type="text"
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    placeholder="Search products..."
                    className="w-full rounded-xl border border-secondary/20 bg-white py-2 pl-10 pr-20 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-accent px-3 py-1.5 text-xs font-bold text-white">
                    Go
                </button>
            </form>

            {isFiltered && (
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 rounded-xl text-xs"
                    onClick={clearFilters}
                >
                    <X className="h-3 w-3" /> Clear all filters
                </Button>
            )}
        </div>
    );
}
