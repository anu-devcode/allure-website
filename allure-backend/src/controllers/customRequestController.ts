import { Request, Response } from "express";
import prisma from "../services/prisma.js";

export const createRequest = async (req: Request, res: Response) => {
    try {
        const { customerName, customerPhone, itemLink, description, imageUrls } = req.body;

        if (!customerName || !customerPhone || !description) {
            return res.status(400).json({ message: "Name, phone, and description are required" });
        }

        const customRequest = await prisma.customRequest.create({
            data: {
                customerName,
                customerPhone,
                itemLink,
                description,
                imageUrls: imageUrls || [],
            },
        });

        res.status(201).json(customRequest);
    } catch (error) {
        console.error("Create custom request error:", error);
        res.status(500).json({ message: "Failed to create custom request" });
    }
};

export const getRequests = async (req: Request, res: Response) => {
    try {
        const requests = await prisma.customRequest.findMany({
            orderBy: { createdAt: "desc" },
        });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch custom requests" });
    }
};

export const updateRequestStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, adminNotes } = req.body;

        const updatedRequest = await prisma.customRequest.update({
            where: { id: id as string },
            data: { status, adminNotes },
        });

        res.json(updatedRequest);
    } catch (error) {
        res.status(500).json({ message: "Failed to update custom request" });
    }
};
