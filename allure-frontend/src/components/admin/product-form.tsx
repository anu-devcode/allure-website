"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Link2, Save, Star, X, ImagePlus, Package } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Product, ProductDetails } from "@/types";
import { AdminCategory } from "@/services/adminProductService";
import { deriveProductType } from "@/lib/product-type";

interface ProductFormProps {
    initialData?: Product;
    isEditing?: boolean;
    categories: AdminCategory[];
    onSubmit: (values: {
        name: string;
        categoryId: string;
        price: number;
        salePrice?: number;
        compareAtPrice?: number;
        sku?: string;
        stockQuantity?: number;
        isBulkAvailable?: boolean;
        bulkMinQty?: number;
        bulkPrice?: number;
        availability: Product["availability"];
        origin?: string;
        description: string;
        images: string[];
        currentSlug?: string;
        badge?: string;
        productType?: string;
        details?: ProductDetails;
    }) => Promise<void>;
}

const categoryFallbacks = ["Dresses", "Tops", "Bottoms", "Outerwear", "Accessories"];
const localImageStorageKey = "allure-admin-local-images";
const badgeOptions = ["", "New", "Bestseller", "Limited", "Hot", "Sale", "Exclusive"];

export function ProductForm({ initialData, categories, onSubmit }: ProductFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [localImages, setLocalImages] = useState<string[]>([]);

    const initialCategory = categories.find((category) => category.name === initialData?.category);

    const [formData, setFormData] = useState({
        name: "",
        categoryId: initialCategory?.id ?? categories[0]?.id ?? "",
        price: "",
        salePrice: "",
        compareAtPrice: "",
        sku: "",
        stockQuantity: "0",
        isBulkAvailable: false,
        bulkMinQty: "",
        bulkPrice: "",
        availability: "In-Store" as Product["availability"],
        origin: "",
        description: "",
        images: [] as string[],
        currentSlug: undefined as string | undefined,
        badge: "",
        productType: "Clothing",
        details: {} as ProductDetails,
        ...
            (initialData
                ? {
                    name: initialData.name,
                    price: String(initialData.price),
                    salePrice: initialData.salePrice ? String(initialData.salePrice) : "",
                    compareAtPrice: initialData.compareAtPrice ? String(initialData.compareAtPrice) : "",
                    sku: initialData.sku ?? "",
                    stockQuantity: String(initialData.stockQuantity ?? 0),
                    isBulkAvailable: initialData.isBulkAvailable ?? false,
                    bulkMinQty: initialData.bulkMinQty ? String(initialData.bulkMinQty) : "",
                    bulkPrice: initialData.bulkPrice ? String(initialData.bulkPrice) : "",
                    availability: initialData.availability,
                    origin: initialData.origin ?? "",
                    description: initialData.description,
                    images: initialData.gallery ?? (initialData.image ? [initialData.image] : []),
                    currentSlug: initialData.slug,
                    badge: initialData.badge ?? "",
                    productType: initialData.productType ?? "Clothing",
                    details: (initialData.details ?? {}) as ProductDetails,
                }
                : {}),
    });

    const hasImages = formData.images.length > 0;
    const coverImage = useMemo(() => formData.images[0], [formData.images]);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(localImageStorageKey);
            if (stored) {
                setLocalImages(JSON.parse(stored) as string[]);
            }
        } catch {
            setLocalImages([]);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(localImageStorageKey, JSON.stringify(localImages.slice(0, 30)));
        } catch {
            return;
        }
    }, [localImages]);

    useEffect(() => {
        if (!formData.categoryId && categories[0]?.id) {
            setFormData((prev) => ({ ...prev, categoryId: categories[0].id }));
        }
    }, [categories, formData.categoryId]);

    const selectedCategoryName = useMemo(() => {
        const selectedCategory = categories.find((category) => category.id === formData.categoryId);
        return selectedCategory?.name ?? initialData?.category ?? "";
    }, [categories, formData.categoryId, initialData?.category]);

    const selectedCategoryType = useMemo(() => {
        const selectedCategory = categories.find((category) => category.id === formData.categoryId);
        return selectedCategory?.productType;
    }, [categories, formData.categoryId]);

    const effectiveProductType = useMemo(
        () => deriveProductType(selectedCategoryName, selectedCategoryType ?? formData.productType) ?? "Other",
        [formData.productType, selectedCategoryName, selectedCategoryType]
    );

    const handleAddImage = () => {
        const value = imageUrl.trim();
        if (!value) {
            return;
        }

        if (formData.images.includes(value)) {
            setImageUrl("");
            return;
        }

        setFormData((prev) => ({
            ...prev,
            images: [...prev.images, value],
        }));
        setImageUrl("");
    };

    const addImages = (items: string[]) => {
        if (!items.length) {
            return;
        }

        setFormData((prev) => {
            const nextImages = [...prev.images];
            items.forEach((item) => {
                if (!nextImages.includes(item)) {
                    nextImages.push(item);
                }
            });
            return { ...prev, images: nextImages };
        });
    };

    const handleUploadFiles = (files: FileList | null) => {
        if (!files || files.length === 0) {
            return;
        }

        const readers = Array.from(files).map(
            (file) =>
                new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(String(reader.result));
                    reader.onerror = () => reject(new Error("Failed to read file"));
                    reader.readAsDataURL(file);
                })
        );

        Promise.all(readers)
            .then((dataUrls) => {
                addImages(dataUrls);
                setLocalImages((current) => [...dataUrls, ...current]);
            })
            .catch(() => {
                return;
            });
    };

    const handleRemoveImage = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
    };

    const handleSetCover = (index: number) => {
        setFormData((prev) => {
            const selected = prev.images[index];
            const nextImages = [selected, ...prev.images.filter((_, i) => i !== index)];
            return { ...prev, images: nextImages };
        });
    };

    const updateDetail = (key: string, value: string | number | boolean) => {
        setFormData((prev) => ({
            ...prev,
            details: {
                ...prev.details,
                [key]: value,
            },
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage("");

        if (!formData.name.trim()) {
            setErrorMessage("Product name is required.");
            return;
        }

        if (!formData.categoryId) {
            setErrorMessage("Category is required.");
            return;
        }

        if (!formData.price || Number(formData.price) <= 0) {
            setErrorMessage("Price must be greater than zero.");
            return;
        }

        if (formData.isBulkAvailable && (!formData.bulkMinQty || !formData.bulkPrice)) {
            setErrorMessage("Bulk pricing requires a minimum quantity and bulk price.");
            return;
        }

        setLoading(true);

        try {
            await onSubmit({
                name: formData.name,
                categoryId: formData.categoryId,
                price: Number(formData.price),
                salePrice: formData.salePrice ? Number(formData.salePrice) : undefined,
                compareAtPrice: formData.compareAtPrice ? Number(formData.compareAtPrice) : undefined,
                sku: formData.sku || undefined,
                stockQuantity: Number(formData.stockQuantity || 0),
                isBulkAvailable: formData.isBulkAvailable,
                bulkMinQty: formData.bulkMinQty ? Number(formData.bulkMinQty) : undefined,
                bulkPrice: formData.bulkPrice ? Number(formData.bulkPrice) : undefined,
                availability: formData.availability,
                origin: formData.origin || undefined,
                description: formData.description,
                images: formData.images,
                currentSlug: formData.currentSlug,
                badge: formData.badge || undefined,
                productType: effectiveProductType,
                details: formData.details,
            });

            setLoading(false);
            router.push("/admin/products");
        } catch (error) {
            setLoading(false);
            const status = (error as { response?: { status?: number } })?.response?.status;
            if (status === 413) {
                setErrorMessage("Image payload too large. Use smaller images or fewer files.");
                return;
            }
            if (status === 401) {
                setErrorMessage("Your session expired. Please sign in again.");
                setTimeout(() => {
                    router.push("/admin/login");
                }, 600);
                return;
            }
            setErrorMessage("Failed to save product. Please check the form and try again.");
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

            {errorMessage ? (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                    {errorMessage}
                </div>
            ) : null}

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
                                <label className="text-sm font-bold text-dark/80">Product Type</label>
                                <div className="flex h-12 items-center rounded-xl border border-secondary/20 bg-secondary/5 px-4 text-sm font-medium text-dark/70">
                                    {effectiveProductType}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-dark/80">Sale Price (Optional)</label>
                                <input
                                    type="number"
                                    value={formData.salePrice}
                                    onChange={e => setFormData({ ...formData, salePrice: e.target.value })}
                                    placeholder="0.00"
                                    className="h-12 rounded-xl border border-secondary/20 bg-white px-4 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-dark/80">Compare At (Optional)</label>
                                <input
                                    type="number"
                                    value={formData.compareAtPrice}
                                    onChange={e => setFormData({ ...formData, compareAtPrice: e.target.value })}
                                    placeholder="0.00"
                                    className="h-12 rounded-xl border border-secondary/20 bg-white px-4 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-dark/80">SKU</label>
                                <input
                                    type="text"
                                    value={formData.sku}
                                    onChange={e => setFormData({ ...formData, sku: e.target.value })}
                                    placeholder="ALR-001"
                                    className="h-12 rounded-xl border border-secondary/20 bg-white px-4 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-dark/80">Badge</label>
                                <select
                                    value={formData.badge}
                                    onChange={e => setFormData({ ...formData, badge: e.target.value })}
                                    className="h-12 rounded-xl border border-secondary/20 bg-white px-4 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                                >
                                    {badgeOptions.map((badge) => (
                                        <option key={badge || "none"} value={badge}>
                                            {badge || "None"}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-dark/80">Stock Quantity</label>
                                <input
                                    type="number"
                                    min={0}
                                    value={formData.stockQuantity}
                                    onChange={e => setFormData({ ...formData, stockQuantity: e.target.value })}
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

                        <label className="flex items-center gap-3 rounded-2xl border border-secondary/10 p-4">
                            <input
                                type="checkbox"
                                className="h-4 w-4 accent-accent"
                                checked={formData.isBulkAvailable}
                                onChange={e => setFormData({ ...formData, isBulkAvailable: e.target.checked })}
                            />
                            <div>
                                <p className="text-sm font-bold text-dark">Bulk available</p>
                                <p className="text-xs text-dark/40">Enable bulk pricing for wholesale orders.</p>
                            </div>
                        </label>

                        {formData.isBulkAvailable ? (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-dark/80">Bulk Minimum Qty</label>
                                    <input
                                        type="number"
                                        min={1}
                                        value={formData.bulkMinQty}
                                        onChange={e => setFormData({ ...formData, bulkMinQty: e.target.value })}
                                        className="h-12 rounded-xl border border-secondary/20 bg-white px-4 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-dark/80">Bulk Price (ETB)</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={formData.bulkPrice}
                                        onChange={e => setFormData({ ...formData, bulkPrice: e.target.value })}
                                        className="h-12 rounded-xl border border-secondary/20 bg-white px-4 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                                    />
                                </div>
                            </div>
                        ) : null}
                    </div>

                    <div className="rounded-3xl bg-white p-8 shadow-sm border border-secondary/10 flex flex-col gap-6">
                        <h3 className="font-bold text-xl text-dark flex items-center gap-2">
                            <Package className="h-5 w-5 text-accent" /> Product Details
                        </h3>

                        {effectiveProductType === "Clothing" ? (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-dark/80">Gender</label>
                                    <select
                                        value={String(formData.details?.gender ?? "")}
                                        onChange={(e) => updateDetail("gender", e.target.value)}
                                        className="h-12 rounded-xl border border-secondary/20 bg-white px-4 text-sm"
                                    >
                                        <option value="">Select</option>
                                        <option value="Female">Female</option>
                                        <option value="Male">Male</option>
                                        <option value="Unisex">Unisex</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-dark/80">Age Group</label>
                                    <select
                                        value={String(formData.details?.ageGroup ?? "")}
                                        onChange={(e) => updateDetail("ageGroup", e.target.value)}
                                        className="h-12 rounded-xl border border-secondary/20 bg-white px-4 text-sm"
                                    >
                                        <option value="">Select</option>
                                        <option value="Adult">Adult</option>
                                        <option value="Kids">Kids</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-dark/80">Material</label>
                                    <input
                                        value={String(formData.details?.material ?? "")}
                                        onChange={(e) => updateDetail("material", e.target.value)}
                                        placeholder="Cotton, Linen..."
                                        className="h-12 rounded-xl border border-secondary/20 bg-white px-4 text-sm"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-dark/80">Fit</label>
                                    <input
                                        value={String(formData.details?.fit ?? "")}
                                        onChange={(e) => updateDetail("fit", e.target.value)}
                                        placeholder="Regular, Slim..."
                                        className="h-12 rounded-xl border border-secondary/20 bg-white px-4 text-sm"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-dark/80">Sizes</label>
                                    <input
                                        value={String(formData.details?.sizes ?? "")}
                                        onChange={(e) => updateDetail("sizes", e.target.value)}
                                        placeholder="S, M, L, XL"
                                        className="h-12 rounded-xl border border-secondary/20 bg-white px-4 text-sm"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-dark/80">Care</label>
                                    <input
                                        value={String(formData.details?.care ?? "")}
                                        onChange={(e) => updateDetail("care", e.target.value)}
                                        placeholder="Hand wash, Dry clean..."
                                        className="h-12 rounded-xl border border-secondary/20 bg-white px-4 text-sm"
                                    />
                                </div>
                            </div>
                        ) : null}

                        {effectiveProductType === "Shoes" ? (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-dark/80">Size Range</label>
                                    <input
                                        value={String(formData.details?.sizeRange ?? "")}
                                        onChange={(e) => updateDetail("sizeRange", e.target.value)}
                                        placeholder="36-44"
                                        className="h-12 rounded-xl border border-secondary/20 bg-white px-4 text-sm"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-dark/80">Material</label>
                                    <input
                                        value={String(formData.details?.material ?? "")}
                                        onChange={(e) => updateDetail("material", e.target.value)}
                                        placeholder="Leather, Canvas..."
                                        className="h-12 rounded-xl border border-secondary/20 bg-white px-4 text-sm"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-dark/80">Heel Height</label>
                                    <input
                                        value={String(formData.details?.heelHeight ?? "")}
                                        onChange={(e) => updateDetail("heelHeight", e.target.value)}
                                        placeholder="2cm, 4cm..."
                                        className="h-12 rounded-xl border border-secondary/20 bg-white px-4 text-sm"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-dark/80">Gender</label>
                                    <select
                                        value={String(formData.details?.gender ?? "")}
                                        onChange={(e) => updateDetail("gender", e.target.value)}
                                        className="h-12 rounded-xl border border-secondary/20 bg-white px-4 text-sm"
                                    >
                                        <option value="">Select</option>
                                        <option value="Female">Female</option>
                                        <option value="Male">Male</option>
                                        <option value="Unisex">Unisex</option>
                                    </select>
                                </div>
                            </div>
                        ) : null}

                        {effectiveProductType === "Jewelry" ? (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-dark/80">Material</label>
                                    <input
                                        value={String(formData.details?.material ?? "")}
                                        onChange={(e) => updateDetail("material", e.target.value)}
                                        placeholder="Gold, Silver..."
                                        className="h-12 rounded-xl border border-secondary/20 bg-white px-4 text-sm"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-dark/80">Plating</label>
                                    <input
                                        value={String(formData.details?.plating ?? "")}
                                        onChange={(e) => updateDetail("plating", e.target.value)}
                                        placeholder="18k, Rhodium..."
                                        className="h-12 rounded-xl border border-secondary/20 bg-white px-4 text-sm"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-dark/80">Stone</label>
                                    <input
                                        value={String(formData.details?.stone ?? "")}
                                        onChange={(e) => updateDetail("stone", e.target.value)}
                                        placeholder="Pearl, Crystal..."
                                        className="h-12 rounded-xl border border-secondary/20 bg-white px-4 text-sm"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-dark/80">Length/Size</label>
                                    <input
                                        value={String(formData.details?.size ?? "")}
                                        onChange={(e) => updateDetail("size", e.target.value)}
                                        placeholder="45cm, Adjustable"
                                        className="h-12 rounded-xl border border-secondary/20 bg-white px-4 text-sm"
                                    />
                                </div>
                            </div>
                        ) : null}

                        {effectiveProductType === "Accessories" ? (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-dark/80">Material</label>
                                    <input
                                        value={String(formData.details?.material ?? "")}
                                        onChange={(e) => updateDetail("material", e.target.value)}
                                        placeholder="Leather, Nylon..."
                                        className="h-12 rounded-xl border border-secondary/20 bg-white px-4 text-sm"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-dark/80">Size/Dimensions</label>
                                    <input
                                        value={String(formData.details?.dimensions ?? "")}
                                        onChange={(e) => updateDetail("dimensions", e.target.value)}
                                        placeholder="20cm x 30cm"
                                        className="h-12 rounded-xl border border-secondary/20 bg-white px-4 text-sm"
                                    />
                                </div>
                            </div>
                        ) : null}

                        {effectiveProductType === "Cosmetics" ? (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-dark/80">Shade</label>
                                    <input
                                        value={String(formData.details?.shade ?? "")}
                                        onChange={(e) => updateDetail("shade", e.target.value)}
                                        placeholder="Rose, Nude..."
                                        className="h-12 rounded-xl border border-secondary/20 bg-white px-4 text-sm"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-dark/80">Volume</label>
                                    <input
                                        value={String(formData.details?.volume ?? "")}
                                        onChange={(e) => updateDetail("volume", e.target.value)}
                                        placeholder="30ml"
                                        className="h-12 rounded-xl border border-secondary/20 bg-white px-4 text-sm"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-dark/80">Skin Type</label>
                                    <input
                                        value={String(formData.details?.skinType ?? "")}
                                        onChange={(e) => updateDetail("skinType", e.target.value)}
                                        placeholder="All, Dry, Oily"
                                        className="h-12 rounded-xl border border-secondary/20 bg-white px-4 text-sm"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-dark/80">Usage</label>
                                    <input
                                        value={String(formData.details?.usage ?? "")}
                                        onChange={(e) => updateDetail("usage", e.target.value)}
                                        placeholder="AM/PM"
                                        className="h-12 rounded-xl border border-secondary/20 bg-white px-4 text-sm"
                                    />
                                </div>
                            </div>
                        ) : null}

                        {effectiveProductType === "Perfumes" ? (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-dark/80">Volume</label>
                                    <input
                                        value={String(formData.details?.volume ?? "")}
                                        onChange={(e) => updateDetail("volume", e.target.value)}
                                        placeholder="50ml"
                                        className="h-12 rounded-xl border border-secondary/20 bg-white px-4 text-sm"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-dark/80">Concentration</label>
                                    <input
                                        value={String(formData.details?.concentration ?? "")}
                                        onChange={(e) => updateDetail("concentration", e.target.value)}
                                        placeholder="EDP, EDT"
                                        className="h-12 rounded-xl border border-secondary/20 bg-white px-4 text-sm"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-dark/80">Top Notes</label>
                                    <input
                                        value={String(formData.details?.notesTop ?? "")}
                                        onChange={(e) => updateDetail("notesTop", e.target.value)}
                                        placeholder="Citrus, Floral"
                                        className="h-12 rounded-xl border border-secondary/20 bg-white px-4 text-sm"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-dark/80">Base Notes</label>
                                    <input
                                        value={String(formData.details?.notesBase ?? "")}
                                        onChange={(e) => updateDetail("notesBase", e.target.value)}
                                        placeholder="Musk, Amber"
                                        className="h-12 rounded-xl border border-secondary/20 bg-white px-4 text-sm"
                                    />
                                </div>
                            </div>
                        ) : null}

                        {effectiveProductType === "Other" ? (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-dark/80">Tags</label>
                                    <input
                                        value={String(formData.details?.tags ?? "")}
                                        onChange={(e) => updateDetail("tags", e.target.value)}
                                        placeholder="Shein, Limited"
                                        className="h-12 rounded-xl border border-secondary/20 bg-white px-4 text-sm"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-dark/80">Notes</label>
                                    <input
                                        value={String(formData.details?.notes ?? "")}
                                        onChange={(e) => updateDetail("notes", e.target.value)}
                                        placeholder="Additional details"
                                        className="h-12 rounded-xl border border-secondary/20 bg-white px-4 text-sm"
                                    />
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>

                {/* Right Column: Media */}
                <div className="flex flex-col gap-6">
                    <div className="rounded-3xl bg-white p-8 shadow-sm border border-secondary/10 flex flex-col gap-6">
                        <h3 className="font-bold text-xl text-dark">Product Images</h3>
                        <div className="flex flex-col gap-3">
                            <label className="text-sm font-bold text-dark/80">Image URL</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark/40" />
                                    <input
                                        type="url"
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                        placeholder="https://..."
                                        className="h-11 w-full rounded-xl border border-secondary/20 bg-white pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-accent/20"
                                    />
                                </div>
                                <Button type="button" variant="outline" className="h-11 rounded-xl" onClick={handleAddImage}>
                                    Add
                                </Button>
                            </div>
                            <p className="text-[11px] text-dark/40">Add a cover image first, then optional gallery images.</p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <label className="text-sm font-bold text-dark/80">Upload Local Images</label>
                            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-secondary/20 bg-secondary/5 px-4 py-3 text-sm text-dark/60 hover:border-accent/40">
                                <ImagePlus className="h-4 w-4" />
                                <span>Choose images from your computer</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={(event) => handleUploadFiles(event.target.files)}
                                />
                            </label>
                            {localImages.length > 0 ? (
                                <div className="flex flex-col gap-2">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-dark/40">Local Library</label>
                                    <select
                                        className="h-11 rounded-xl border border-secondary/20 bg-white px-3 text-sm"
                                        onChange={(event) => {
                                            const value = event.target.value;
                                            if (value) {
                                                addImages([value]);
                                                event.currentTarget.value = "";
                                            }
                                        }}
                                    >
                                        <option value="">Select a stored image</option>
                                        {localImages.slice(0, 20).map((item, index) => (
                                            <option key={`${item}-${index}`} value={item}>
                                                Local image {index + 1}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ) : null}
                        </div>

                        <div className="rounded-2xl border border-secondary/10 bg-secondary/5 p-4">
                            {hasImages ? (
                                <div className="flex items-center gap-4">
                                    <div className="h-24 w-20 overflow-hidden rounded-xl border border-secondary/10 bg-white">
                                        <img src={coverImage} alt="Cover" className="h-full w-full object-cover" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-dark">Cover Image</p>
                                        <p className="text-xs text-dark/50">Shown on product cards and listings.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-sm text-dark/40">No images added yet.</div>
                            )}
                        </div>

                        {hasImages ? (
                            <div className="grid grid-cols-2 gap-3">
                                {formData.images.map((image, index) => (
                                    <div key={image} className="relative overflow-hidden rounded-xl border border-secondary/10 bg-secondary/5">
                                        <img src={image} alt={`Product image ${index + 1}`} className="h-24 w-full object-cover" />
                                        <div className="absolute inset-x-2 bottom-2 flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleSetCover(index)}
                                                className="flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-bold text-dark shadow-sm"
                                            >
                                                <Star className="h-3 w-3" />
                                                Cover
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage(index)}
                                                className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-red-500 shadow-sm"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : null}
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
