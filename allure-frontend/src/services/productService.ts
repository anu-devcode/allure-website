import axios from "axios";
import { Product } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

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
    reviewCount?: number;
    averageRating?: number | null;
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
    reviewCount: product.reviewCount ?? 0,
    averageRating: product.averageRating ?? null,
    description: product.description ?? "",
    variants: [],
});

export const productService = {
    async getProducts(): Promise<Product[]> {
        const response = await axios.get<ApiProduct[]>(`${API_BASE_URL}/products`);
        return response.data.map(mapApiProduct);
    },

    async getProductById(id: string): Promise<Product | undefined> {
        try {
            const response = await axios.get<ApiProduct>(`${API_BASE_URL}/products/${id}`);
            return mapApiProduct(response.data);
        } catch {
            return undefined;
        }
    },

    async getProductsByCategory(category: string): Promise<Product[]> {
        const products = await this.getProducts();
        return products.filter((p) => p.category === category);
    },

    async searchProducts(query: string): Promise<Product[]> {
        const products = await this.getProducts();
        const searchLower = query.toLowerCase();
        return products.filter(
            (p) =>
                p.name.toLowerCase().includes(searchLower) ||
                p.description.toLowerCase().includes(searchLower) ||
                p.category.toLowerCase().includes(searchLower)
        );
    }
};
