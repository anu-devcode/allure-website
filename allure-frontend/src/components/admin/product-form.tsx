"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Upload, Save, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Product } from "@/types";
import { AdminCategory } from "@/services/adminProductService";

interface ProductFormProps {
    initialData?: Product;
    isEditing?: boolean;
    categories: AdminCategory[];
    onSubmit: (values: {
        name: string;
        categoryId: string;
        price: number;
        availability: Product["availability"];
        origin?: string;
        description: string;
        images: string[];
        currentSlug?: string;
    }) => Promise<void>;
}

const categoryFallbacks = ["Dresses", "Tops", "Bottoms", "Outerwear", "Accessories"];

export function ProductForm({ initialData, categories, onSubmit }: ProductFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const initialCategory = categories.find((category) => category.name === initialData?.category);

    const [formData, setFormData] = useState({
        name: "",
        categoryId: initialCategory?.id ?? categories[0]?.id ?? "",
        price: "",
        availability: "In-Store" as Product["availability"],
        origin: "",
        description: "",
        images: [] as string[],
        currentSlug: undefined as string | undefined,
        ...
            (initialData
                ? {
                    name: initialData.name,
                    price: String(initialData.price),
                    availability: initialData.availability,
                    origin: initialData.origin ?? "",
                    description: initialData.description,
                    images: initialData.gallery ?? (initialData.image ? [initialData.image] : []),
                    currentSlug: initialData.slug,
                }
                : {}),
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await onSubmit({
                name: formData.name,
                categoryId: formData.categoryId,
                price: Number(formData.price),
                availability: formData.availability,
                origin: formData.origin || undefined,
                description: formData.description,
                images: formData.images,
                currentSlug: formData.currentSlug,
            });

            setLoading(false);
            router.push("/admin/products");
        } catch {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <Link href="/admin/products" className="inline-flex items-center gap-2 text-sm text-dark/60 hover:text-accent">
                    <ChevronLeft className="h-4 w-4" /> Back to Products
                </Link>
                <div className="flex gap-3">
                    <Button type="button" variant="outline" className="rounded-2xl px-6" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit" variant="primary" className="rounded-2xl px-8 gap-2 shadow-lg shadow-accent/20" disabled={loading}>
                        {loading ? "Saving..." : <><Save className="h-4 w-4" /> Save Product</>}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Left Column: Details */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="rounded-3xl bg-white p-8 shadow-sm border border-secondary/10 flex flex-col gap-6">
                        <h3 className="font-bold text-xl text-dark">Basic Information</h3>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-dark/80">Product Name</label>
                            <input
                                required
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Elegant Silk Maxi Dress"
                                className="h-12 rounded-xl border border-secondary/20 bg-white px-4 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-dark/80">Category</label>
                                <select
                                    value={formData.categoryId}
                                    onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                                    className="h-12 rounded-xl border border-secondary/20 bg-white px-4 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                                >
                                    {(categories.length > 0 ? categories : categoryFallbacks.map((name) => ({ id: name, name, slug: name.toLowerCase() }))).map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-dark/80">Price (ETB)</label>
                                <input
                                    required
                                    type="number"
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                    placeholder="0.00"
                                    className="h-12 rounded-xl border border-secondary/20 bg-white px-4 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-dark/80">Description</label>
                            <textarea
                                rows={4}
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe the product details, materials, and fit..."
                                className="rounded-xl border border-secondary/20 bg-white p-4 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                            />
                        </div>
                    </div>

                    <div className="rounded-3xl bg-white p-8 shadow-sm border border-secondary/10 flex flex-col gap-6">
                        <h3 className="font-bold text-xl text-dark">Inventory & Origin</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-dark/80">Availability</label>
                                <select
                                    value={formData.availability}
                                    onChange={e => setFormData({ ...formData, availability: e.target.value as Product["availability"] })}
                                    className="h-12 rounded-xl border border-secondary/20 bg-white px-4 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                                >
                                    <option>In-Store</option>
                                    <option>Pre-Order</option>
                                    <option>Sold Out</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-dark/80">Origin (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.origin}
                                    onChange={e => setFormData({ ...formData, origin: e.target.value })}
                                    placeholder="e.g. Turkey, Shein"
                                    className="h-12 rounded-xl border border-secondary/20 bg-white px-4 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Media */}
                <div className="flex flex-col gap-6">
                    <div className="rounded-3xl bg-white p-8 shadow-sm border border-secondary/10 flex flex-col gap-6">
                        <h3 className="font-bold text-xl text-dark">Product Images</h3>
                        <div className="aspect-square rounded-2xl border-2 border-dashed border-secondary/20 flex flex-col items-center justify-center gap-4 text-dark/40 hover:border-accent hover:text-accent transition-all cursor-pointer bg-secondary/5">
                            <Upload className="h-8 w-8" />
                            <div className="text-center">
                                <p className="text-sm font-bold text-dark">Upload Image</p>
                                <p className="text-[10px]">JPG, PNG up to 5MB</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {[1, 2].map(i => (
                                <div key={i} className="aspect-square rounded-xl bg-secondary/10 relative group border border-secondary/10">
                                    <button className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-3xl bg-primary/20 p-8 border border-primary/30">
                        <h4 className="font-bold text-sm text-dark mb-2 uppercase tracking-widest">Admin Tip</h4>
                        <p className="text-xs text-dark/60 leading-relaxed">
                            Products marked as "Pre-Order" will display a Turkish/Shein origin badge to build transparency with customers.
                        </p>
                    </div>
                </div>
            </div>
        </form>
    );
}
