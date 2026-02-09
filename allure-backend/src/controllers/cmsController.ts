import { Request, Response } from 'express';
import prisma from '../services/prisma.js';

export const getSettings = async (req: Request, res: Response): Promise<void> => {
    try {
        const settings = await prisma.setting.findMany();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching settings', error });
    }
};

export const updateSettings = async (req: Request, res: Response): Promise<void> => {
    try {
        const { settings } = req.body; // Array of { key, value }

        const updates = settings.map((s: { key: string, value: string }) =>
            prisma.setting.upsert({
                where: { key: s.key },
                update: { value: s.value },
                create: { key: s.key, value: s.value },
            })
        );

        await Promise.all(updates);
        res.json({ message: 'Settings updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating settings', error });
    }
};
