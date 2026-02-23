import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../services/prisma.js';

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
                _count: { select: { orders: true } },
            },
        });

        res.json(customers);
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
            },
        });

        res.status(201).json(customer);
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
            },
        });

        res.json(updated);
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
