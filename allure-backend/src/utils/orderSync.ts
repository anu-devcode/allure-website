import prisma from '../services/prisma.js';

export const normalizePhone = (phone: string): string => {
    const digits = phone.replace(/\D/g, '');

    if (digits.startsWith('251') && digits.length === 12) {
        return `0${digits.slice(3)}`;
    }

    if (digits.length === 9 && digits.startsWith('9')) {
        return `0${digits}`;
    }

    return digits;
};

export const claimGuestOrdersForCustomer = async (customerId: string, phone?: string | null): Promise<number> => {
    if (!phone) {
        return 0;
    }

    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
        return 0;
    }

    const matchingOrders = await prisma.order.findMany({
        where: {
            customerId: null,
        },
        select: {
            id: true,
            customerPhone: true,
        },
    });

    const orderIds = matchingOrders
        .filter((order) => normalizePhone(order.customerPhone) === normalizedPhone)
        .map((order) => order.id);

    if (orderIds.length === 0) {
        return 0;
    }

    const result = await prisma.order.updateMany({
        where: {
            id: {
                in: orderIds,
            },
            customerId: null,
        },
        data: {
            customerId,
        },
    });

    return result.count;
};