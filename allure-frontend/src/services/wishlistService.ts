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
    availability: ApiAvailability;
    origin: string | null;
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

const mapApiProduct = (product: ApiProduct): Product => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    image: product.images[0] ?? "",
    gallery: product.images,
    category: product.category.name,
    availability: availabilityMap[product.availability],
    origin: product.origin ?? undefined,
    description: product.description ?? "",
    variants: [],
});

const buildHeaders = (token?: string | null, guestId?: string) => ({
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(guestId ? { "x-guest-id": guestId } : {}),
});

export const wishlistService = {
    async getWishlist(token?: string | null, guestId?: string): Promise<Product[]> {
        const response = await axios.get<{ items: ApiProduct[] }>(`${API_BASE_URL}/wishlist`, {
            headers: buildHeaders(token, guestId),
        });
        return response.data.items.map(mapApiProduct);
    },

    async addItem(productId: string, token?: string | null, guestId?: string): Promise<Product[]> {
        const response = await axios.post<{ items: ApiProduct[] }>(
            `${API_BASE_URL}/wishlist/items`,
            { productId },
            { headers: buildHeaders(token, guestId) }
        );
        return response.data.items.map(mapApiProduct);
    },

    async removeItem(productId: string, token?: string | null, guestId?: string): Promise<Product[]> {
        const response = await axios.delete<{ items: ApiProduct[] }>(`${API_BASE_URL}/wishlist/items/${productId}`, {
            headers: buildHeaders(token, guestId),
        });
        return response.data.items.map(mapApiProduct);
    },

    async syncGuestToCustomer(token: string, guestId: string): Promise<Product[]> {
        const response = await axios.post<{ items: ApiProduct[] }>(
            `${API_BASE_URL}/wishlist/sync`,
            { guestId },
            { headers: buildHeaders(token) }
        );
        return response.data.items.map(mapApiProduct);
    },
};
