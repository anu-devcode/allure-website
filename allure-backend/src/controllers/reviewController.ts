import { Request, Response } from 'express';
import prisma from '../services/prisma.js';

export const createReview = async (req: Request, res: Response): Promise<void> => {
    try {
        const { customerName, customerEmail, productName, rating, comment } = req.body;

        if (!customerName || !rating || !comment) {
            res.status(400).json({ message: 'customerName, rating, and comment are required' });
            return;
        }

        const parsedRating = Number(rating);
        if (Number.isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
            res.status(400).json({ message: 'rating must be between 1 and 5' });
            return;
        }

        const review = await prisma.review.create({
            data: {
                customerName,
                customerEmail,
                productName,
                rating: parsedRating,
                comment,
            },
        });

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: 'Error creating review', error });
    }
};

export const getPublicReviews = async (_req: Request, res: Response): Promise<void> => {
    try {
        const reviews = await prisma.review.findMany({
            where: { isApproved: true },
            orderBy: { createdAt: 'desc' },
        });

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews', error });
    }
};

export const getAdminReviews = async (_req: Request, res: Response): Promise<void> => {
    try {
        const reviews = await prisma.review.findMany({
            orderBy: { createdAt: 'desc' },
        });

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews', error });
    }
};

export const updateReview = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { customerName, customerEmail, productName, rating, comment, isApproved } = req.body;

        const updatedReview = await prisma.review.update({
            where: { id: id as string },
            data: {
                customerName,
                customerEmail,
                productName,
                rating,
                comment,
                isApproved,
            },
        });

        res.json(updatedReview);
    } catch (error) {
        res.status(500).json({ message: 'Error updating review', error });
    }
};

export const deleteReview = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await prisma.review.delete({ where: { id: id as string } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting review', error });
    }
};
