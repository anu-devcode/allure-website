export type Availability = "In-Store" | "Pre-Order" | "Sold Out";

export interface ProductVariant {
    name: string; // e.g. "Size", "Color"
    options: string[]; // e.g. ["S", "M", "L"], ["Sage", "Olive"]
}

export type ProductDetails = {
    [key: string]: string | number | boolean | string[] | undefined | null;
};

export interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    salePrice?: number;
    compareAtPrice?: number;
    sku?: string;
    stockQuantity?: number;
    isBulkAvailable?: boolean;
    bulkMinQty?: number;
    bulkPrice?: number;
    image: string;
    gallery?: string[];
    category: string;
    availability: Availability;
    origin?: string; // e.g. "Shein", "Turkey"
    badge?: string;
    productType?: string;
    details?: ProductDetails;
    estimatedArrival?: string; // e.g. "10-14 days"
    reviewCount?: number;
    averageRating?: number | null;
    description: string;
    variants: ProductVariant[];
}

export type OrderStatus = "New" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";
export type PaymentStatus = "Pending" | "Paid" | "Refunded";

export interface OrderItem {
    id: string;
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    canReview?: boolean;
    reviewId?: string | null;
    reviewRating?: number | null;
    reviewComment?: string | null;
    reviewApproved?: boolean | null;
    variantSelection?: {
        [key: string]: string;
    };
}

export interface Review {
    id: string;
    customerId?: string | null;
    customerName: string;
    customerEmail?: string | null;
    productId?: string | null;
    productName?: string | null;
    productSlug?: string | null;
    orderId?: string | null;
    orderNumber?: string | null;
    rating: number;
    comment: string;
    isApproved: boolean;
    isVerifiedPurchase: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface Order {
    id: string;
    orderNumber: string;
    customerId?: string | null;
    customerName: string;
    phone: string;
    city: string;
    total: number;
    items: OrderItem[];
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    paymentReference?: string | null;
    paymentProof?: string | null;
    orderSource?: "Guest" | "Account";
    createdAt: string;
}
