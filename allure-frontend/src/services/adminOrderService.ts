import axios from "axios";
import { Order } from "@/types";
import { adminAuthService } from "@/services/adminAuthService";
import { useAdminAuth } from "@/store/useAdminAuth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

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
    REFUNDED: "Refunded",
};

const getActiveAdminToken = (fallbackToken?: string | null) => fallbackToken ?? useAdminAuth.getState().token;

const tryRefreshAdminToken = async (): Promise<string | null> => {
    const { refreshToken } = useAdminAuth.getState();

    if (!refreshToken) {
        return null;
    }

    try {
        const refreshed = await adminAuthService.refresh(refreshToken);
        useAdminAuth.setState({
            admin: {
                id: refreshed.user.id,
                email: refreshed.user.email,
                name: refreshed.user.name ?? undefined,
                role: refreshed.user.role,
            },
            token: refreshed.token,
            refreshToken: refreshed.refreshToken,
            isAuthenticated: true,
        });

        return refreshed.token;
    } catch {
        useAdminAuth.setState({ admin: null, token: null, refreshToken: null, isAuthenticated: false });
        return null;
    }
};

const executeWithAdminAuthRetry = async <T>(
    requestFactory: (token: string) => Promise<T>,
    providedToken?: string
): Promise<T> => {
    const initialToken = getActiveAdminToken(providedToken);

    if (!initialToken) {
        throw new Error("Admin authentication required");
    }

    try {
        return await requestFactory(initialToken);
    } catch (error) {
        if (!axios.isAxiosError(error) || error.response?.status !== 401) {
            throw error;
        }

        const refreshedToken = await tryRefreshAdminToken();
        if (!refreshedToken) {
            throw error;
        }

        return requestFactory(refreshedToken);
    }
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
        name: item.productName ?? item.product?.name ?? "Product",
        price: item.price,
        quantity: item.quantity,
        image: item.productImage ?? item.product?.images?.[0] ?? "",
        variantSelection: item.variantSelection ?? undefined,
    })),
});

export const adminOrderService = {
    async getOrders(token: string): Promise<Order[]> {
        const response = await executeWithAdminAuthRetry(
            (activeToken) => axios.get<ApiOrder[]>(`${API_BASE_URL}/orders`, {
                headers: { Authorization: `Bearer ${activeToken}` },
            }),
            token
        );
        return response.data.map(mapApiOrder);
    },

    async getOrderById(token: string, id: string): Promise<Order> {
        const response = await executeWithAdminAuthRetry(
            (activeToken) => axios.get<ApiOrder>(`${API_BASE_URL}/orders/${id}`, {
                headers: { Authorization: `Bearer ${activeToken}` },
            }),
            token
        );
        return mapApiOrder(response.data);
    },

    async updateOrderStatus(
        token: string,
        id: string,
        payload: {
            status?: Order["status"];
            paymentStatus?: Order["paymentStatus"];
            paymentReference?: string | null;
            paymentProof?: string | null;
        }
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
            Refunded: "REFUNDED",
        };

        const response = await executeWithAdminAuthRetry(
            (activeToken) => axios.patch<ApiOrder>(
                `${API_BASE_URL}/orders/${id}/status`,
                {
                    status: payload.status ? statusReverseMap[payload.status] : undefined,
                    paymentStatus: payload.paymentStatus ? paymentReverseMap[payload.paymentStatus] : undefined,
                    paymentReference: payload.paymentReference,
                    paymentProof: payload.paymentProof,
                },
                {
                    headers: { Authorization: `Bearer ${activeToken}` },
                }
            ),
            token
        );

        return mapApiOrder(response.data);
    },
};
