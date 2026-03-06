import axios from "axios";
import { Order } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const GUEST_ORDER_STORAGE_KEY = "allure-guest-order-tracking";

type ApiOrder = {
    id: string;
    orderNumber: string;
    customerId: string | null;
    customerName: string;
    customerPhone: string;
    city: string;
    total: number;
    status: "NEW" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
    paymentStatus: "PENDING" | "PAID" | "REFUNDED";
    paymentReference?: string | null;
    paymentProof?: string | null;
    createdAt: string;
    items: Array<{
        id: string;
        productId: string;
        productName: string;
        productImage: string | null;
        quantity: number;
        price: number;
        canReview?: boolean | null;
        reviewId?: string | null;
        reviewRating?: number | null;
        reviewComment?: string | null;
        reviewApproved?: boolean | null;
        variantSelection?: Record<string, string> | null;
    }>;
};

export type GuestOrderReference = {
    orderNumber: string;
    phone: string;
    createdAt: string;
};

const statusMap: Record<ApiOrder["status"], Order["status"]> = {
    NEW: "New",
    CONFIRMED: "Confirmed",
    SHIPPED: "Shipped",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
};

const paymentStatusMap: Record<ApiOrder["paymentStatus"], Order["paymentStatus"]> = {
    PENDING: "Pending",
    PAID: "Paid",
    REFUNDED: "Refunded",
};

const getStoredGuestOrders = (): GuestOrderReference[] => {
    if (typeof window === "undefined") {
        return [];
    }

    try {
        const raw = window.localStorage.getItem(GUEST_ORDER_STORAGE_KEY);
        if (!raw) {
            return [];
        }

        const parsed = JSON.parse(raw) as GuestOrderReference[];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const setStoredGuestOrders = (orders: GuestOrderReference[]) => {
    if (typeof window === "undefined") {
        return;
    }

    window.localStorage.setItem(GUEST_ORDER_STORAGE_KEY, JSON.stringify(orders.slice(0, 10)));
};

const rememberGuestOrder = (orderNumber: string, phone: string) => {
    const nextOrders = [
        {
            orderNumber,
            phone,
            createdAt: new Date().toISOString(),
        },
        ...getStoredGuestOrders().filter((entry) => entry.orderNumber !== orderNumber),
    ];

    setStoredGuestOrders(nextOrders);
};

const mapApiOrder = (order: ApiOrder): Order => ({
    id: order.id,
    orderNumber: order.orderNumber,
    customerId: order.customerId,
    customerName: order.customerName,
    phone: order.customerPhone,
    city: order.city,
    total: order.total,
    status: statusMap[order.status],
    paymentStatus: paymentStatusMap[order.paymentStatus],
    paymentReference: order.paymentReference ?? null,
    paymentProof: order.paymentProof ?? null,
    orderSource: order.customerId ? "Account" : "Guest",
    createdAt: order.createdAt,
    items: (order.items ?? []).map((item) => ({
        id: item.id,
        productId: item.productId,
        name: item.productName,
        price: item.price,
        quantity: item.quantity,
        image: item.productImage ?? "",
        canReview: item.canReview ?? undefined,
        reviewId: item.reviewId ?? undefined,
        reviewRating: item.reviewRating ?? undefined,
        reviewComment: item.reviewComment ?? undefined,
        reviewApproved: item.reviewApproved ?? undefined,
        variantSelection: item.variantSelection ?? undefined,
    })),
});

export const orderService = {
    async createOrder(payload: {
        customerName: string;
        phone: string;
        city: string;
        items: Array<{ productId: string; quantity: number; variantSelection?: Record<string, string> }>;
    }, token?: string | null): Promise<Order> {
        const response = await axios.post<ApiOrder>(`${API_BASE_URL}/orders`, payload, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const mappedOrder = mapApiOrder(response.data);

        if (!token) {
            rememberGuestOrder(mappedOrder.orderNumber, payload.phone);
        }

        return mappedOrder;
    },

    async getMyOrders(token: string): Promise<Order[]> {
        const response = await axios.get<ApiOrder[]>(`${API_BASE_URL}/orders/my`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data.map(mapApiOrder);
    },

    async trackOrder(payload: { orderNumber: string; phone: string }): Promise<Order> {
        const response = await axios.post<ApiOrder>(`${API_BASE_URL}/orders/track`, payload);
        const mappedOrder = mapApiOrder(response.data);
        rememberGuestOrder(mappedOrder.orderNumber, payload.phone);
        return mappedOrder;
    },

    getTrackedGuestOrders(): GuestOrderReference[] {
        return getStoredGuestOrders();
    },

    removeTrackedGuestOrder(orderNumber: string): void {
        setStoredGuestOrders(getStoredGuestOrders().filter((entry) => entry.orderNumber !== orderNumber));
    },
};
