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
        productName?: string;
        productImage?: string | null;
        quantity: number;
        price: number;
        variantSelection?: Record<string, string> | null;
        product?: {
            name: string;
            images: string[];
        } | null;
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
        name: item.productName ?? item.product?.name ?? "Product",
        price: item.price,
        quantity: item.quantity,
        image: item.productImage ?? item.product?.images?.[0] ?? "",
        variantSelection: item.variantSelection ?? undefined,
    })),
});

export const adminOrderService = {
    async getOrders(token: string): Promise<Order[]> {
        const response = await axios.get<ApiOrder[]>(`${API_BASE_URL}/orders`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data.map(mapApiOrder);
    },

    async getOrderById(token: string, id: string): Promise<Order> {
        const response = await axios.get<ApiOrder>(`${API_BASE_URL}/orders/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return mapApiOrder(response.data);
    },

    async updateOrderStatus(
        token: string,
        id: string,
        payload: { status?: Order["status"]; paymentStatus?: Order["paymentStatus"] }
    ): Promise<Order> {
        const statusReverseMap: Record<Order["status"], ApiOrder["status"]> = {
            New: "NEW",
            Confirmed: "CONFIRMED",
            Shipped: "SHIPPED",
            Delivered: "DELIVERED",
            Cancelled: "CANCELLED",
        };

        const paymentReverseMap: Record<Order["paymentStatus"], ApiOrder["paymentStatus"]> = {
            Pending: "PENDING",
            Paid: "PAID",
        };

        const response = await axios.patch<ApiOrder>(
            `${API_BASE_URL}/orders/${id}/status`,
            {
                status: payload.status ? statusReverseMap[payload.status] : undefined,
                paymentStatus: payload.paymentStatus ? paymentReverseMap[payload.paymentStatus] : undefined,
            },
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        return mapApiOrder(response.data);
    },
};
