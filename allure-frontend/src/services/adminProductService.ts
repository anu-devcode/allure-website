import axios from "axios";
import { Product } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface AdminCategory {
    id: string;
    name: string;
    slug: string;
    productCount?: number;
}

type ApiCategory = {
    id: string;
    name: string;
    slug: string;
    _count?: {
        products?: number;
    };
};

type ApiAvailability = "IN_STORE" | "PRE_ORDER" | "SOLD_OUT";

type ApiProduct = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    salePrice?: number | null;
    compareAtPrice?: number | null;
    sku?: string | null;
    stockQuantity?: number | null;
    isBulkAvailable?: boolean | null;
    bulkMinQty?: number | null;
    bulkPrice?: number | null;
    availability: ApiAvailability;
    origin: string | null;
    badge?: string | null;
    productType?: string | null;
    details?: Record<string, unknown> | null;
    images: string[];
    category: {
        id: string;
        name: string;
        slug: string;
    };
};

const availabilityMap: Record<ApiAvailability, Product["availability"]> = {
    IN_STORE: "In-Store",
    PRE_ORDER: "Pre-Order",
    SOLD_OUT: "Sold Out",
};

const reverseAvailabilityMap: Record<Product["availability"], ApiAvailability> = {
    "In-Store": "IN_STORE",
    "Pre-Order": "PRE_ORDER",
    "Sold Out": "SOLD_OUT",
};

const mapApiProduct = (product: ApiProduct): Product => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    salePrice: product.salePrice ?? undefined,
    compareAtPrice: product.compareAtPrice ?? undefined,
    sku: product.sku ?? undefined,
    stockQuantity: product.stockQuantity ?? undefined,
    isBulkAvailable: product.isBulkAvailable ?? undefined,
    bulkMinQty: product.bulkMinQty ?? undefined,
    bulkPrice: product.bulkPrice ?? undefined,
    image: product.images[0] ?? "",
    gallery: product.images,
    category: product.category.name,
    availability: availabilityMap[product.availability],
    origin: product.origin ?? undefined,
    badge: product.badge ?? undefined,
    productType: product.productType ?? undefined,
    details: (product.details ?? undefined) as Product["details"],
    description: product.description ?? "",
    variants: [],
});

const slugify = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

export const adminProductService = {
    async getCategories(): Promise<AdminCategory[]> {
        const response = await axios.get<ApiCategory[]>(`${API_BASE_URL}/products/categories`);
        return response.data.map((category) => ({
            id: category.id,
            name: category.name,
            slug: category.slug,
            productCount: category._count?.products ?? 0,
        }));
    },

    async createCategory(token: string, payload: { name: string; slug: string }): Promise<AdminCategory> {
        const response = await axios.post<ApiCategory>(`${API_BASE_URL}/products/categories`, payload, {
            headers: { Authorization: `Bearer ${token}` },
        });

        return {
            id: response.data.id,
            name: response.data.name,
            slug: response.data.slug,
            productCount: response.data._count?.products ?? 0,
        };
    },

    async updateCategory(token: string, id: string, payload: { name: string; slug: string }): Promise<AdminCategory> {
        const response = await axios.put<ApiCategory>(`${API_BASE_URL}/products/categories/${id}`, payload, {
            headers: { Authorization: `Bearer ${token}` },
        });

        return {
            id: response.data.id,
            name: response.data.name,
            slug: response.data.slug,
            productCount: response.data._count?.products ?? 0,
        };
    },

    async deleteCategory(token: string, id: string): Promise<void> {
        await axios.delete(`${API_BASE_URL}/products/categories/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
    },

    async getProducts(): Promise<Product[]> {
        const response = await axios.get<ApiProduct[]>(`${API_BASE_URL}/products`);
        return response.data.map(mapApiProduct);
    },

    async getProductById(id: string): Promise<Product> {
        const response = await axios.get<ApiProduct>(`${API_BASE_URL}/products/${id}`);
        return mapApiProduct(response.data);
    },

    async createProduct(
        token: string,
        payload: {
            name: string;
            description: string;
            price: number;
            salePrice?: number;
            compareAtPrice?: number;
            sku?: string;
            stockQuantity?: number;
            isBulkAvailable?: boolean;
            bulkMinQty?: number;
            bulkPrice?: number;
            categoryId: string;
            availability: Product["availability"];
            origin?: string;
            badge?: string;
            productType?: string;
            details?: Product["details"];
            images: string[];
        }
    ): Promise<Product> {
        const response = await axios.post<ApiProduct>(
            `${API_BASE_URL}/products`,
            {
                ...payload,
                slug: `${slugify(payload.name)}-${Date.now()}`,
                availability: reverseAvailabilityMap[payload.availability],
            },
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        return mapApiProduct(response.data);
    },

    async updateProduct(
        token: string,
        id: string,
        payload: {
            name: string;
            description: string;
            price: number;
            salePrice?: number;
            compareAtPrice?: number;
            sku?: string;
            stockQuantity?: number;
            isBulkAvailable?: boolean;
            bulkMinQty?: number;
            bulkPrice?: number;
            categoryId: string;
            availability: Product["availability"];
            origin?: string;
            badge?: string;
            productType?: string;
            details?: Product["details"];
            images: string[];
            currentSlug?: string;
        }
    ): Promise<Product> {
        const response = await axios.put<ApiProduct>(
            `${API_BASE_URL}/products/${id}`,
            {
                ...payload,
                slug: payload.currentSlug ?? `${slugify(payload.name)}-${Date.now()}`,
                availability: reverseAvailabilityMap[payload.availability],
            },
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        return mapApiProduct(response.data);
    },

    async deleteProduct(token: string, id: string): Promise<void> {
        await axios.delete(`${API_BASE_URL}/products/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
    },
};
