import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../services/prisma.js';

const serializeAdminCustomer = (customer: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    city: string | null;
    createdAt: Date;
    updatedAt: Date;
    orders: Array<{
        id: string;
        orderNumber: string;
        status: 'NEW' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
        total: number;
        createdAt: Date;
    }>;
}) => {
    const orders = [...customer.orders].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const deliveredOrderCount = orders.filter((order) => order.status === 'DELIVERED').length;
    const pendingOrderCount = orders.filter((order) => order.status !== 'DELIVERED' && order.status !== 'CANCELLED').length;
    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
    const lastOrder = orders[0];

    return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        city: customer.city,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
        orderCount: orders.length,
        deliveredOrderCount,
        pendingOrderCount,
        totalSpent,
        lastOrderAt: lastOrder?.createdAt ?? null,
        lastOrderNumber: lastOrder?.orderNumber ?? null,
        _count: {
            orders: orders.length,
        },
    };
};

export const getCustomers = async (_req: Request, res: Response): Promise<void> => {
    try {
        const customers = await prisma.user.findMany({
            where: { role: 'CUSTOMER' },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                city: true,
                createdAt: true,
                updatedAt: true,
                orders: {
                    select: {
                        id: true,
                        orderNumber: true,
                        status: true,
                        total: true,
                        createdAt: true,
                    },
                },
            },
        });

        res.json(customers.map(serializeAdminCustomer));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching customers', error });
    }
};

export const createCustomerByAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, phone, city, password } = req.body;

        if (!name || !email || !phone || !password) {
            res.status(400).json({ message: 'name, email, phone, and password are required' });
            return;
        }

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { phone }],
            },
            select: { id: true },
        });

        if (existingUser) {
            res.status(400).json({ message: 'Customer with email or phone already exists' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const customer = await prisma.user.create({
            data: {
                name,
                email,
                phone,
                city,
                password: hashedPassword,
                role: 'CUSTOMER',
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                city: true,
                createdAt: true,
                updatedAt: true,
                orders: {
                    select: {
                        id: true,
                        orderNumber: true,
                        status: true,
                        total: true,
                        createdAt: true,
                    },
                },
            },
        });

        res.status(201).json(serializeAdminCustomer(customer));
    } catch (error) {
        res.status(500).json({ message: 'Error creating customer', error });
    }
};

export const updateCustomerByAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, email, phone, city, password } = req.body;

        const customer = await prisma.user.findUnique({
            where: { id: id as string },
            select: { id: true, role: true },
        });

        if (!customer || customer.role !== 'CUSTOMER') {
            res.status(404).json({ message: 'Customer not found' });
            return;
        }

        const passwordHash = password ? await bcrypt.hash(password, 10) : undefined;

        const updated = await prisma.user.update({
            where: { id: id as string },
            data: {
                name,
                email,
                phone,
                city,
                ...(passwordHash ? { password: passwordHash } : {}),
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                city: true,
                createdAt: true,
                updatedAt: true,
                orders: {
                    select: {
                        id: true,
                        orderNumber: true,
                        status: true,
                        total: true,
                        createdAt: true,
                    },
                },
            },
        });

        res.json(serializeAdminCustomer(updated));
    } catch (error) {
        res.status(500).json({ message: 'Error updating customer', error });
    }
};

export const deleteCustomerByAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const customer = await prisma.user.findUnique({
            where: { id: id as string },
            select: { id: true, role: true },
        });

        if (!customer || customer.role !== 'CUSTOMER') {
            res.status(404).json({ message: 'Customer not found' });
            return;
        }

        await prisma.user.delete({ where: { id: id as string } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting customer', error });
    }
};
