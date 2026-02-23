"use client";

import { useEffect, useState } from "react";
import { ProductForm } from "@/components/admin/product-form";
import { adminProductService, AdminCategory } from "@/services/adminProductService";
import { useAdminAuth } from "@/store/useAdminAuth";

export default function NewProductPage() {
    const token = useAdminAuth((s) => s.token);
    const [categories, setCategories] = useState<AdminCategory[]>([]);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const result = await adminProductService.getCategories();
                setCategories(result);
            } catch {
                setCategories([]);
            }
        };

        void loadCategories();
    }, []);

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-display text-4xl font-bold text-dark">Add New Product</h1>
                <p className="text-dark/60">Create a new listing for your store.</p>
            </div>
            <ProductForm
                categories={categories}
                onSubmit={async (values) => {
                    if (!token) {
                        throw new Error("Missing admin token");
                    }

                    await adminProductService.createProduct(token, {
                        name: values.name,
                        description: values.description,
                        price: values.price,
                        categoryId: values.categoryId,
                        availability: values.availability,
                        origin: values.origin,
                        images: values.images,
                    });
                }}
            />
        </div>
    );
}
