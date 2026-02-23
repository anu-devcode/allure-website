"use client";

import { use, useEffect, useState } from "react";
import { ProductForm } from "@/components/admin/product-form";
import { AdminCategory, adminProductService } from "@/services/adminProductService";
import { Product } from "@/types";
import { useAdminAuth } from "@/store/useAdminAuth";

interface EditProductPageProps {
    params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: EditProductPageProps) {
    const { id } = use(params);
    const token = useAdminAuth((s) => s.token);
    const [product, setProduct] = useState<Product | null>(null);
    const [categories, setCategories] = useState<AdminCategory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [productResult, categoryResult] = await Promise.all([
                    adminProductService.getProductById(id),
                    adminProductService.getCategories(),
                ]);
                setProduct(productResult);
                setCategories(categoryResult);
            } catch {
                setProduct(null);
                setCategories([]);
            } finally {
                setLoading(false);
            }
        };

        void loadData();
    }, [id]);

    if (loading) {
        return <div className="text-sm text-dark/40">Loading product...</div>;
    }

    if (!product) {
        return <div className="text-sm text-dark/40">Product not found.</div>;
    }

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-display text-4xl font-bold text-dark">Edit Product</h1>
                <p className="text-dark/60">Updating: {product.name}</p>
            </div>
            <ProductForm
                initialData={product}
                isEditing
                categories={categories}
                onSubmit={async (values) => {
                    if (!token) {
                        throw new Error("Missing admin token");
                    }

                    await adminProductService.updateProduct(token, id, {
                        name: values.name,
                        description: values.description,
                        price: values.price,
                        categoryId: values.categoryId,
                        availability: values.availability,
                        origin: values.origin,
                        images: values.images,
                        currentSlug: values.currentSlug,
                    });
                }}
            />
        </div>
    );
}
