export type Availability = "In-Store" | "Pre-Order" | "Sold Out";

export interface ProductVariant {
    name: string; // e.g. "Size", "Color"
    options: string[]; // e.g. ["S", "M", "L"], ["Sage", "Olive"]
}

export interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    image: string;
    gallery?: string[];
    category: string;
    availability: Availability;
    origin?: string; // e.g. "Shein", "Turkey"
    estimatedArrival?: string; // e.g. "10-14 days"
    description: string;
    variants: ProductVariant[];
}

export type OrderStatus = "New" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";
export type PaymentStatus = "Pending" | "Paid";

export interface OrderItem {
    id: string;
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    variantSelection?: {
        [key: string]: string;
    };
}

export interface Order {
    id: string;
    orderNumber: string;
    customerName: string;
    phone: string;
    city: string;
    total: number;
    items: OrderItem[];
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    createdAt: string;
}
