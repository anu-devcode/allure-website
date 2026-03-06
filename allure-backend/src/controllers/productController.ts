import { Request, Response } from 'express';
import prisma from '../services/prisma.js';

const withEmptyReviewSummary = <T extends { id: string }>(products: T[]) =>
    products.map((product) => ({
        ...product,
        reviewCount: 0,
        averageRating: null,
    }));

const attachReviewSummary = async <T extends { id: string }>(products: T[]) => {
    const productIds = products.map((product) => product.id);

    if (productIds.length === 0) {
        return withEmptyReviewSummary(products);
    }

    try {
        const grouped = await prisma.review.groupBy({
            by: ['productId'],
            where: {
                isApproved: true,
                productId: { in: productIds },
            },
            _count: { productId: true },
            _avg: { rating: true },
        });

        const summaryMap = new Map(
            grouped
                .filter((entry) => entry.productId)
                .map((entry) => [entry.productId as string, {
                    reviewCount: entry._count.productId,
                    averageRating: entry._avg.rating,
                }])
        );

        return products.map((product) => ({
            ...product,
            reviewCount: summaryMap.get(product.id)?.reviewCount ?? 0,
            averageRating: summaryMap.get(product.id)?.averageRating ?? null,
        }));
    } catch (error) {
        console.warn('Unable to attach product review summary. Returning products without review aggregates.', error);
        return withEmptyReviewSummary(products);
    }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            name,
            slug,
            description,
            price,
            salePrice,
            compareAtPrice,
            sku,
            stockQuantity,
            isBulkAvailable,
            bulkMinQty,
            bulkPrice,
            categoryId,
            availability,
            origin,
            badge,
            productType,
            details,
            images,
        } = req.body;
        const product = await prisma.product.create({
            data: {
                name,
                slug,
                description,
                price,
                salePrice,
                compareAtPrice,
                sku,
                stockQuantity,
                isBulkAvailable,
                bulkMinQty,
                bulkPrice,
                categoryId,
                availability,
                origin,
                badge,
                productType,
                details,
                images,
            },
            include: { category: true },
        });
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error creating product', error });
    }
};

export const getProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const products = await prisma.product.findMany({
            include: { category: true },
        });
        res.json(await attachReviewSummary(products));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error });
    }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const product = await prisma.product.findUnique({
            where: { id: id as string },
            include: { category: true },
        });
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        const [productWithSummary] = await attachReviewSummary([product]);
        res.json(productWithSummary);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product', error });
    }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const {
            name,
            slug,
            description,
            price,
            salePrice,
            compareAtPrice,
            sku,
            stockQuantity,
            isBulkAvailable,
            bulkMinQty,
            bulkPrice,
            categoryId,
            availability,
            origin,
            badge,
            productType,
            details,
            images,
        } = req.body;
        const product = await prisma.product.update({
            where: { id: id as string },
            data: {
                name,
                slug,
                description,
                price,
                salePrice,
                compareAtPrice,
                sku,
                stockQuantity,
                isBulkAvailable,
                bulkMinQty,
                bulkPrice,
                categoryId,
                availability,
                origin,
                badge,
                productType,
                details,
                images,
            },
            include: { category: true },
        });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error updating product', error });
    }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await prisma.product.delete({ where: { id: id as string } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error });
    }
};
