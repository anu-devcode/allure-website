import { Request, Response } from 'express';
import prisma from '../services/prisma.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

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
                customerPhone: resolvedPhone,
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

        const orders = await prisma.order.findMany({
            where: { customerId: req.user.userId },
            include: { items: true },
            orderBy: { createdAt: 'desc' },
        });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching customer orders', error });
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
        const { status, paymentStatus } = req.body;
        const order = await prisma.order.update({
            where: { id: id as string },
            data: { status, paymentStatus },
        });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Error updating order', error });
    }
};
