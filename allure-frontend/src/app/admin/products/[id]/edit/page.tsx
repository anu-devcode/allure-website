"use client";

import { use } from "react";
import { MOCK_PRODUCTS } from "@/data/mock-products";
import { ProductForm } from "@/components/admin/product-form";
import { notFound } from "next/navigation";

interface EditProductPageProps {
    params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: EditProductPageProps) {
    const { id } = use(params);
    const product = MOCK_PRODUCTS.find((p) => p.id === id);

    if (!product) return notFound();

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-display text-4xl font-bold text-dark">Edit Product</h1>
                <p className="text-dark/60">Updating: {product.name}</p>
            </div>
            <ProductForm initialData={product} isEditing />
        </div>
    );
}
