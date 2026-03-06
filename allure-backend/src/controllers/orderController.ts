import { Request, Response } from 'express';
import prisma from '../services/prisma.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { claimGuestOrdersForCustomer, normalizePhone } from '../utils/orderSync.js';

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const {
            customerName,
            customerPhone,
            phone,
            city,
            items // Array of { productId, quantity }
        } = req.body;

        if (!customerName || !Array.isArray(items) || items.length === 0) {
            res.status(400).json({ message: 'customerName and items are required' });
            return;
        }

        const resolvedPhone = customerPhone ?? phone;
        if (!resolvedPhone) {
            res.status(400).json({ message: 'phone is required' });
            return;
        }

        const normalizedResolvedPhone = normalizePhone(resolvedPhone);
        if (!normalizedResolvedPhone) {
            res.status(400).json({ message: 'A valid phone number is required' });
            return;
        }

        // Calculate total and prepare order items
        let total = 0;
        const orderItemsData: {
            productId: string;
            quantity: number;
            price: number;
            productName: string;
            productImage: string | null;
            variantSelection?: Record<string, string>;
        }[] = [];

        for (const item of items) {
            if (!item?.productId || typeof item?.quantity !== 'number' || item.quantity <= 0) {
                res.status(400).json({ message: 'Each item must include productId and quantity > 0' });
                return;
            }

            const product = await prisma.product.findUnique({ where: { id: item.productId } });
            if (!product) {
                res.status(404).json({ message: `Product ${item.productId} not found` });
                return;
            }

            total += product.price * item.quantity;
            orderItemsData.push({
                productId: item.productId,
                quantity: item.quantity,
                price: product.price,
                productName: product.name,
                productImage: product.images[0] ?? null,
                variantSelection: item.variantSelection,
            });
        }

        // Generate a simple order number
        const count = await prisma.order.count();
        const orderNumber = `ORD-${1000 + count + 1}`;

        const order = await prisma.order.create({
            data: {
                orderNumber,
                customerId: req.user?.role === 'CUSTOMER' ? req.user.userId : undefined,
                customerName,
                customerPhone: normalizedResolvedPhone,
                city,
                total,
                items: {
                    create: orderItemsData,
                },
            },
            include: {
                items: {
                    include: { product: true }
                }
            }
        });

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: 'Error creating order', error });
    }
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        const orders = await prisma.order.findMany({
            include: { items: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error });
    }
};

export const getCustomerOrders = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId || req.user.role !== 'CUSTOMER') {
            res.status(403).json({ message: 'Customer access required' });
            return;
        }

        const customer = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: { phone: true },
        });

        await claimGuestOrdersForCustomer(req.user.userId, customer?.phone);

        const orders = await prisma.order.findMany({
            where: { customerId: req.user.userId },
            include: { items: true },
            orderBy: { createdAt: 'desc' },
        });

        const orderIds = orders.map((order) => order.id);
        const customerReviews = orderIds.length
            ? await prisma.review.findMany({
                where: {
                    customerId: req.user.userId,
                    orderId: { in: orderIds },
                },
                select: {
                    id: true,
                    orderId: true,
                    productId: true,
                    rating: true,
                    comment: true,
                    isApproved: true,
                },
            })
            : [];

        const reviewMap = new Map(
            customerReviews
                .filter((review) => review.orderId && review.productId)
                .map((review) => [`${review.orderId}:${review.productId}`, review])
        );

        const hydratedOrders = orders.map((order) => ({
            ...order,
            items: order.items.map((item) => {
                const review = reviewMap.get(`${order.id}:${item.productId}`);
                return {
                    ...item,
                    reviewId: review?.id ?? null,
                    reviewRating: review?.rating ?? null,
                    reviewComment: review?.comment ?? null,
                    reviewApproved: review?.isApproved ?? null,
                    canReview: order.status === 'DELIVERED' && !review,
                };
            }),
        }));

        res.json(hydratedOrders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching customer orders', error });
    }
};

export const trackOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const orderNumber = typeof req.body?.orderNumber === 'string' ? req.body.orderNumber.trim().toUpperCase() : '';
        const phone = typeof req.body?.phone === 'string' ? req.body.phone.trim() : '';

        if (!orderNumber || !phone) {
            res.status(400).json({ message: 'orderNumber and phone are required' });
            return;
        }

        const order = await prisma.order.findUnique({
            where: { orderNumber },
            include: { items: { include: { product: true } } },
        });

        if (!order || normalizePhone(order.customerPhone) !== normalizePhone(phone)) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Error tracking order', error });
    }
};

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const order = await prisma.order.findUnique({
            where: { id: id as string },
            include: { items: { include: { product: true } } }
        });
        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching order', error });
    }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status, paymentStatus, paymentReference, paymentProof } = req.body;

        const existingOrder = await prisma.order.findUnique({
            where: { id: id as string },
            include: { items: { include: { product: true } } },
        });

        if (!existingOrder) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }

        const nextData: {
            status?: typeof existingOrder.status;
            paymentStatus?: typeof existingOrder.paymentStatus;
            paymentReference?: string | null;
            paymentProof?: string | null;
        } = {};

        if (status) {
            nextData.status = status;
        }

        if (paymentStatus) {
            nextData.paymentStatus = paymentStatus;
        }

        if (typeof paymentReference === 'string') {
            nextData.paymentReference = paymentReference.trim() || null;
        }

        if (typeof paymentProof === 'string') {
            nextData.paymentProof = paymentProof.trim() || null;
        }

        if (paymentStatus === 'PAID' && !status && existingOrder.status === 'NEW') {
            nextData.status = 'CONFIRMED';
        }

        if (status === 'DELIVERED' && !paymentStatus && existingOrder.paymentStatus === 'PENDING') {
            nextData.paymentStatus = 'PAID';
        }

        if (paymentStatus === 'REFUNDED' && !status && existingOrder.status !== 'CANCELLED') {
            nextData.status = existingOrder.status;
        }

        if (
            nextData.status === undefined &&
            nextData.paymentStatus === undefined &&
            nextData.paymentReference === undefined &&
            nextData.paymentProof === undefined
        ) {
            res.status(400).json({ message: 'No valid updates were provided' });
            return;
        }

        const order = await prisma.order.update({
            where: { id: id as string },
            data: nextData,
            include: {
                items: {
                    include: { product: true },
                },
            },
        });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Error updating order', error });
    }
};
