import { Request, Response } from 'express';
import prisma from '../services/prisma.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

const serializeReview = (review: {
    id: string;
    customerId: string | null;
    customerName: string;
    customerEmail: string | null;
    productId: string | null;
    productName: string | null;
    orderId: string | null;
    order?: { id: string; orderNumber: string } | null;
    rating: number;
    comment: string;
    isApproved: boolean;
    isVerifiedPurchase: boolean;
    createdAt: Date;
    updatedAt: Date;
    product?: { id: string; name: string; slug: string } | null;
}) => ({
    id: review.id,
    customerId: review.customerId,
    customerName: review.customerName,
    customerEmail: review.customerEmail,
    productId: review.productId,
    productName: review.product?.name ?? review.productName,
    productSlug: review.product?.slug ?? null,
    orderId: review.orderId,
    orderNumber: review.order?.orderNumber ?? null,
    rating: review.rating,
    comment: review.comment,
    isApproved: review.isApproved,
    isVerifiedPurchase: review.isVerifiedPurchase,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
});

export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId || req.user.role !== 'CUSTOMER') {
            res.status(403).json({ message: 'Customer access required' });
            return;
        }

        const { productId, orderId, rating, comment } = req.body;

        if (!productId || !orderId || !rating || !comment) {
            res.status(400).json({ message: 'productId, orderId, rating, and comment are required' });
            return;
        }

        const parsedRating = Number(rating);
        if (Number.isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
            res.status(400).json({ message: 'rating must be between 1 and 5' });
            return;
        }

        const customer = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: { id: true, name: true, email: true },
        });

        if (!customer) {
            res.status(404).json({ message: 'Customer not found' });
            return;
        }

        const order = await prisma.order.findFirst({
            where: {
                id: orderId,
                customerId: req.user.userId,
                status: 'DELIVERED',
                items: {
                    some: { productId },
                },
            },
            include: {
                items: {
                    where: { productId },
                },
            },
        });

        if (!order) {
            res.status(400).json({ message: 'Only delivered purchased products can be reviewed' });
            return;
        }

        const product = await prisma.product.findUnique({
            where: { id: productId },
            select: { id: true, name: true },
        });

        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }

        const existingReview = await prisma.review.findFirst({
            where: {
                customerId: req.user.userId,
                productId,
                orderId,
            },
        });

        if (existingReview) {
            res.status(400).json({ message: 'You already reviewed this delivered item' });
            return;
        }

        const review = await prisma.review.create({
            data: {
                customerId: customer.id,
                customerName: customer.name ?? 'Customer',
                customerEmail: customer.email,
                productId: product.id,
                productName: product.name,
                orderId: order.id,
                rating: parsedRating,
                comment,
                isVerifiedPurchase: true,
            },
            include: {
                product: {
                    select: { id: true, name: true, slug: true },
                },
                order: {
                    select: { id: true, orderNumber: true },
                },
            },
        });

        res.status(201).json({
            message: 'Review submitted and pending approval',
            review: serializeReview(review),
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating review', error });
    }
};

export const getPublicReviews = async (req: Request, res: Response): Promise<void> => {
    try {
        const reviews = await prisma.review.findMany({
            where: {
                isApproved: true,
                ...(typeof req.query.productId === 'string' ? { productId: req.query.productId } : {}),
            },
            include: {
                product: {
                    select: { id: true, name: true, slug: true },
                },
                order: {
                    select: { id: true, orderNumber: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json(reviews.map(serializeReview));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews', error });
    }
};

export const getProductReviews = async (req: Request, res: Response): Promise<void> => {
    try {
        const { productId } = req.params;

        const reviews = await prisma.review.findMany({
            where: {
                productId,
                isApproved: true,
            },
            include: {
                product: {
                    select: { id: true, name: true, slug: true },
                },
                order: {
                    select: { id: true, orderNumber: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        const aggregate = await prisma.review.aggregate({
            where: {
                productId,
                isApproved: true,
            },
            _avg: { rating: true },
            _count: { id: true },
        });

        res.json({
            reviews: reviews.map(serializeReview),
            summary: {
                averageRating: aggregate._avg.rating,
                reviewCount: aggregate._count.id,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews', error });
    }
};

export const getCustomerReviewEligibility = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId || req.user.role !== 'CUSTOMER') {
            res.status(403).json({ message: 'Customer access required' });
            return;
        }

        const { productId } = req.params;

        const deliveredOrders = await prisma.order.findMany({
            where: {
                customerId: req.user.userId,
                status: 'DELIVERED',
                items: {
                    some: { productId },
                },
            },
            select: {
                id: true,
                orderNumber: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        const existingReviews = await prisma.review.findMany({
            where: {
                customerId: req.user.userId,
                productId,
            },
            include: {
                product: {
                    select: { id: true, name: true, slug: true },
                },
                order: {
                    select: { id: true, orderNumber: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        const reviewedOrderIds = new Set(existingReviews.map((review) => review.orderId).filter(Boolean));
        const availableOrders = deliveredOrders.filter((order) => !reviewedOrderIds.has(order.id));

        res.json({
            canReview: availableOrders.length > 0,
            hasReviewed: existingReviews.length > 0,
            availableOrders,
            latestReview: existingReviews[0] ? serializeReview(existingReviews[0]) : null,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching review eligibility', error });
    }
};

export const getAdminReviews = async (_req: Request, res: Response): Promise<void> => {
    try {
        const reviews = await prisma.review.findMany({
            include: {
                product: {
                    select: { id: true, name: true, slug: true },
                },
                order: {
                    select: { id: true, orderNumber: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json(reviews.map(serializeReview));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews', error });
    }
};

export const updateReview = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { customerName, customerEmail, productName, rating, comment, isApproved } = req.body;

        const existingReview = await prisma.review.findUnique({ where: { id: id as string } });
        if (!existingReview) {
            res.status(404).json({ message: 'Review not found' });
            return;
        }

        const parsedRating = rating === undefined ? undefined : Number(rating);
        if (parsedRating !== undefined && (Number.isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5)) {
            res.status(400).json({ message: 'rating must be between 1 and 5' });
            return;
        }

        const updatedReview = await prisma.review.update({
            where: { id: id as string },
            data: {
                customerName,
                customerEmail,
                productName,
                rating: parsedRating,
                comment,
                isApproved,
            },
            include: {
                product: {
                    select: { id: true, name: true, slug: true },
                },
                order: {
                    select: { id: true, orderNumber: true },
                },
            },
        });

        res.json(serializeReview(updatedReview));
    } catch (error) {
        res.status(500).json({ message: 'Error updating review', error });
    }
};

export const deleteReview = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const existingReview = await prisma.review.findUnique({ where: { id: id as string }, select: { id: true } });
        if (!existingReview) {
            res.status(404).json({ message: 'Review not found' });
            return;
        }
        await prisma.review.delete({ where: { id: id as string } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting review', error });
    }
};
