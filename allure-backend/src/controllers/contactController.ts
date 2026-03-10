import { Request, Response } from 'express';
import { ContactMessageStatus, ReplyChannel } from '@prisma/client';
import prisma from '../services/prisma.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

const normalizePhone = (value: string): string => value.replace(/\D/g, '');

const resolveRegisteredCustomer = async (contact: string) => {
    const trimmed = contact.trim();

    if (EMAIL_REGEX.test(trimmed)) {
        return prisma.user.findUnique({
            where: { email: trimmed.toLowerCase() },
            select: { id: true, name: true, email: true, phone: true },
        });
    }

    const normalized = normalizePhone(trimmed);
    if (normalized.length < 9) {
        return null;
    }

    const candidates = await prisma.user.findMany({
        where: { phone: { not: null } },
        select: { id: true, name: true, email: true, phone: true },
    });

    return candidates.find((candidate) => normalizePhone(candidate.phone ?? '') === normalized) ?? null;
};

const mapContactMessage = (record: {
    id: string;
    name: string;
    contact: string;
    message: string;
    status: ContactMessageStatus;
    followUpAt: Date | null;
    followUpNote: string | null;
    lastReplyAt: Date | null;
    lastReplyChannel: ReplyChannel | null;
    lastReplySummary: string | null;
    createdAt: Date;
    updatedAt: Date;
    customer: { id: string; name: string | null; email: string; phone: string | null } | null;
}) => ({
    id: record.id,
    name: record.name,
    contact: record.contact,
    message: record.message,
    status: record.status,
    followUpAt: record.followUpAt,
    followUpNote: record.followUpNote,
    lastReplyAt: record.lastReplyAt,
    lastReplyChannel: record.lastReplyChannel,
    lastReplySummary: record.lastReplySummary,
    senderType: record.customer ? 'REGISTERED' : 'GUEST',
    customer: record.customer,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
});

export const createContactMessage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, contact, message } = req.body;

        if (!name || !contact || !message) {
            res.status(400).json({ message: 'name, contact, and message are required' });
            return;
        }

        const authReq = req as AuthRequest;
        let customerId: string | undefined;

        if (authReq.user?.domain === 'customer' && authReq.user.role === 'CUSTOMER') {
            customerId = authReq.user.userId;
        } else {
            const matched = await resolveRegisteredCustomer(contact);
            customerId = matched?.id;
        }

        const record = await prisma.contactMessage.create({
            data: {
                name,
                contact,
                message,
                customerId,
            },
            include: {
                customer: {
                    select: { id: true, name: true, email: true, phone: true },
                },
            },
        });

        res.status(201).json(mapContactMessage(record));
    } catch (error) {
        res.status(500).json({ message: 'Error creating contact message', error });
    }
};

export const getContactMessages = async (_req: Request, res: Response): Promise<void> => {
    try {
        const records = await prisma.contactMessage.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                customer: {
                    select: { id: true, name: true, email: true, phone: true },
                },
            },
        });

        res.json(records.map(mapContactMessage));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching contact messages', error });
    }
};

export const updateContactMessage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const {
            status,
            followUpAt,
            followUpNote,
            lastReplyAt,
            lastReplyChannel,
            lastReplySummary,
        } = req.body as {
            status?: ContactMessageStatus;
            followUpAt?: string | null;
            followUpNote?: string | null;
            lastReplyAt?: string | null;
            lastReplyChannel?: ReplyChannel | null;
            lastReplySummary?: string | null;
        };

        const validStatuses: ContactMessageStatus[] = ['NEW', 'IN_PROGRESS', 'FOLLOW_UP', 'RESOLVED'];
        if (status && !validStatuses.includes(status)) {
            res.status(400).json({ message: 'Invalid status value' });
            return;
        }

        const validReplyChannels: ReplyChannel[] = ['PHONE', 'WHATSAPP', 'TELEGRAM', 'EMAIL', 'OTHER'];
        if (lastReplyChannel && !validReplyChannels.includes(lastReplyChannel)) {
            res.status(400).json({ message: 'Invalid reply channel value' });
            return;
        }

        const data: {
            status?: ContactMessageStatus;
            followUpAt?: Date | null;
            followUpNote?: string | null;
            lastReplyAt?: Date | null;
            lastReplyChannel?: ReplyChannel | null;
            lastReplySummary?: string | null;
        } = {};

        if (typeof status !== 'undefined') data.status = status;
        if (typeof followUpAt !== 'undefined') data.followUpAt = followUpAt ? new Date(followUpAt) : null;
        if (typeof followUpNote !== 'undefined') data.followUpNote = followUpNote;
        if (typeof lastReplyAt !== 'undefined') data.lastReplyAt = lastReplyAt ? new Date(lastReplyAt) : null;
        if (typeof lastReplyChannel !== 'undefined') data.lastReplyChannel = lastReplyChannel;
        if (typeof lastReplySummary !== 'undefined') data.lastReplySummary = lastReplySummary;

        const updated = await prisma.contactMessage.update({
            where: { id: id as string },
            data,
            include: {
                customer: {
                    select: { id: true, name: true, email: true, phone: true },
                },
            },
        });

        res.json(mapContactMessage(updated));
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
