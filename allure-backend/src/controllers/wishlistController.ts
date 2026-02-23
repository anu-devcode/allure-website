import { Response } from "express";
import prisma from "../services/prisma.js";
import { AuthRequest } from "../middleware/authMiddleware.js";

const readGuestId = (req: AuthRequest): string | undefined => {
    const rawGuestId = req.headers["x-guest-id"];
    if (!rawGuestId) {
        return undefined;
    }

    if (Array.isArray(rawGuestId)) {
        return rawGuestId[0];
    }

    return rawGuestId;
};

const resolveWishlistOwner = (req: AuthRequest) => {
    const customerId = req.user?.role === "CUSTOMER" ? req.user.userId : undefined;
    const guestId = readGuestId(req);

    return { customerId, guestId };
};

const getOrCreateWishlist = async (owner: { customerId?: string; guestId?: string }) => {
    if (owner.customerId) {
        const existing = await prisma.wishlist.findUnique({ where: { customerId: owner.customerId } });
        if (existing) {
            return existing;
        }

        return prisma.wishlist.create({
            data: {
                customerId: owner.customerId,
            },
        });
    }

    if (owner.guestId) {
        const existing = await prisma.wishlist.findUnique({ where: { guestId: owner.guestId } });
        if (existing) {
            return existing;
        }

        return prisma.wishlist.create({
            data: {
                guestId: owner.guestId,
            },
        });
    }

    return null;
};

export const getWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const owner = resolveWishlistOwner(req);

        if (!owner.customerId && !owner.guestId) {
            res.json({ items: [] });
            return;
        }

        const wishlist = owner.customerId
            ? await prisma.wishlist.findUnique({
                where: { customerId: owner.customerId },
                include: {
                    items: {
                        include: {
                            product: {
                                include: { category: true },
                            },
                        },
                        orderBy: { createdAt: "desc" },
                    },
                },
            })
            : await prisma.wishlist.findUnique({
                where: { guestId: owner.guestId },
                include: {
                    items: {
                        include: {
                            product: {
                                include: { category: true },
                            },
                        },
                        orderBy: { createdAt: "desc" },
                    },
                },
            });

        if (!wishlist) {
            res.json({ items: [] });
            return;
        }

        res.json({ items: wishlist.items.map((item) => item.product) });
    } catch (error) {
        res.status(500).json({ message: "Error fetching wishlist", error });
    }
};

export const addWishlistItem = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const owner = resolveWishlistOwner(req);
        if (!owner.customerId && !owner.guestId) {
            res.status(400).json({ message: "customer auth or x-guest-id is required" });
            return;
        }

        const { productId } = req.body;
        if (!productId) {
            res.status(400).json({ message: "productId is required" });
            return;
        }

        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }

        const wishlist = await getOrCreateWishlist(owner);
        if (!wishlist) {
            res.status(400).json({ message: "Could not resolve wishlist" });
            return;
        }

        await prisma.wishlistItem.upsert({
            where: {
                wishlistId_productId: {
                    wishlistId: wishlist.id,
                    productId,
                },
            },
            update: {},
            create: {
                wishlistId: wishlist.id,
                productId,
            },
        });

        const updated = await prisma.wishlist.findUnique({
            where: { id: wishlist.id },
            include: {
                items: {
                    include: {
                        product: {
                            include: { category: true },
                        },
                    },
                    orderBy: { createdAt: "desc" },
                },
            },
        });

        res.status(201).json({ items: updated?.items.map((item) => item.product) ?? [] });
    } catch (error) {
        res.status(500).json({ message: "Error adding wishlist item", error });
    }
};

export const removeWishlistItem = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const owner = resolveWishlistOwner(req);
        if (!owner.customerId && !owner.guestId) {
            res.status(400).json({ message: "customer auth or x-guest-id is required" });
            return;
        }

        const rawProductId = req.params.productId;
        const productId = Array.isArray(rawProductId) ? rawProductId[0] : rawProductId;
        if (!productId) {
            res.status(400).json({ message: "productId is required" });
            return;
        }

        const wishlist = owner.customerId
            ? await prisma.wishlist.findUnique({ where: { customerId: owner.customerId } })
            : await prisma.wishlist.findUnique({ where: { guestId: owner.guestId } });

        if (!wishlist) {
            res.json({ items: [] });
            return;
        }

        await prisma.wishlistItem.deleteMany({
            where: {
                wishlistId: wishlist.id,
                productId,
            },
        });

        const updated = await prisma.wishlist.findUnique({
            where: { id: wishlist.id },
            include: {
                items: {
                    include: {
                        product: {
                            include: { category: true },
                        },
                    },
                    orderBy: { createdAt: "desc" },
                },
            },
        });

        res.json({ items: updated?.items.map((item) => item.product) ?? [] });
    } catch (error) {
        res.status(500).json({ message: "Error removing wishlist item", error });
    }
};

export const syncGuestWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId || req.user.role !== "CUSTOMER") {
            res.status(403).json({ message: "Customer access required" });
            return;
        }

        const { guestId } = req.body as { guestId?: string };
        if (!guestId) {
            res.status(400).json({ message: "guestId is required" });
            return;
        }

        const [customerWishlist, guestWishlist] = await Promise.all([
            getOrCreateWishlist({ customerId: req.user.userId }),
            prisma.wishlist.findUnique({
                where: { guestId },
                include: {
                    items: true,
                },
            }),
        ]);

        if (!customerWishlist) {
            res.status(500).json({ message: "Could not resolve customer wishlist" });
            return;
        }

        if (guestWishlist) {
            for (const item of guestWishlist.items) {
                await prisma.wishlistItem.upsert({
                    where: {
                        wishlistId_productId: {
                            wishlistId: customerWishlist.id,
                            productId: item.productId,
                        },
                    },
                    update: {},
                    create: {
                        wishlistId: customerWishlist.id,
                        productId: item.productId,
                    },
                });
            }

            await prisma.wishlistItem.deleteMany({ where: { wishlistId: guestWishlist.id } });
            await prisma.wishlist.delete({ where: { id: guestWishlist.id } });
        }

        const updated = await prisma.wishlist.findUnique({
            where: { id: customerWishlist.id },
            include: {
                items: {
                    include: {
                        product: {
                            include: { category: true },
                        },
                    },
                    orderBy: { createdAt: "desc" },
                },
            },
        });

        res.json({ items: updated?.items.map((item) => item.product) ?? [] });
    } catch (error) {
        res.status(500).json({ message: "Error syncing wishlist", error });
    }
};
