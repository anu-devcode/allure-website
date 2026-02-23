import axios from "axios";
import { Order } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type ApiOrder = {
    id: string;
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    city: string;
    total: number;
    status: "NEW" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
    paymentStatus: "PENDING" | "PAID" | "REFUNDED";
    createdAt: string;
    items: Array<{
        id: string;
        productId: string;
        productName: string;
        productImage: string | null;
        quantity: number;
        price: number;
        variantSelection?: Record<string, string> | null;
    }>;
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
    REFUNDED: "Paid",
};

const mapApiOrder = (order: ApiOrder): Order => ({
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    phone: order.customerPhone,
    city: order.city,
    total: order.total,
    status: statusMap[order.status],
    paymentStatus: paymentStatusMap[order.paymentStatus],
    createdAt: order.createdAt,
    items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        name: item.productName,
        price: item.price,
        quantity: item.quantity,
        image: item.productImage ?? "",
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
        return mapApiOrder(response.data);
    },

    async getMyOrders(token: string): Promise<Order[]> {
        const response = await axios.get<ApiOrder[]>(`${API_BASE_URL}/orders/my`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data.map(mapApiOrder);
    },
};
