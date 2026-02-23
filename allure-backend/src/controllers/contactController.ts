import { Request, Response } from 'express';
import prisma from '../services/prisma.js';

export const createContactMessage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, contact, message } = req.body;

        if (!name || !contact || !message) {
            res.status(400).json({ message: 'name, contact, and message are required' });
            return;
        }

        const record = await prisma.contactMessage.create({
            data: {
                name,
                contact,
                message,
            },
        });

        res.status(201).json(record);
    } catch (error) {
        res.status(500).json({ message: 'Error creating contact message', error });
    }
};

export const getContactMessages = async (_req: Request, res: Response): Promise<void> => {
    try {
        const records = await prisma.contactMessage.findMany({
            orderBy: { createdAt: 'desc' },
        });

        res.json(records);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching contact messages', error });
    }
};

export const updateContactMessage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updated = await prisma.contactMessage.update({
            where: { id: id as string },
            data: { status },
        });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Error updating contact message', error });
    }
};

export const deleteContactMessage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await prisma.contactMessage.delete({ where: { id: id as string } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting contact message', error });
    }
};
