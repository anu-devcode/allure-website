import { Request, Response } from 'express';
import prisma from '../services/prisma.js';

export const createCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, slug } = req.body;
        const category = await prisma.category.create({
            data: { name, slug },
        });
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: 'Error creating category', error });
    }
};

export const getCategories = async (req: Request, res: Response): Promise<void> => {
    try {
        const categories = await prisma.category.findMany({
            include: { _count: { select: { products: true } } },
        });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories', error });
    }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, slug } = req.body;
        const category = await prisma.category.update({
            where: { id: id as string },
            data: { name, slug },
        });
        res.json(category);
    } catch (error) {
        res.status(500).json({ message: 'Error updating category', error });
    }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await prisma.category.delete({ where: { id: id as string } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting category', error });
    }
};
