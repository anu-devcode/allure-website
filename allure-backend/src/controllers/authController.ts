import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import prisma from '../services/prisma.js';
import {
    adminLoginSchema,
    customerLoginSchema,
    customerRegisterSchema,
    forgotPasswordSchema,
    refreshTokenSchema,
    resetPasswordSchema,
    updateAdminPasswordSchema,
    updateCustomerProfileSchema,
} from '../schemas/authSchemas.js';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const ACCESS_TOKEN_EXPIRES_IN = (process.env.ACCESS_TOKEN_EXPIRES_IN || '15m') as jwt.SignOptions['expiresIn'];
const REFRESH_TOKEN_DAYS = Number(process.env.REFRESH_TOKEN_DAYS || 7);
const PASSWORD_RESET_TOKEN_MINUTES = Number(process.env.PASSWORD_RESET_TOKEN_MINUTES || 30);
const MAX_FAILED_LOGIN_ATTEMPTS = Number(process.env.MAX_FAILED_LOGIN_ATTEMPTS || 5);
const LOCKOUT_MINUTES = Number(process.env.LOCKOUT_MINUTES || 15);

type TokenDomain = 'customer' | 'admin';
type DbAuthDomain = 'CUSTOMER' | 'ADMIN';

const toPublicCustomer = (user: {
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
    city: string | null;
    createdAt: Date;
}) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    city: user.city,
    joinedAt: user.createdAt,
});

const hashToken = (token: string): string =>
    crypto.createHash('sha256').update(token).digest('hex');

const createAccessToken = (
    user: { id: string; email: string; role: 'CUSTOMER' | 'ADMIN' | 'STAFF' },
    domain: TokenDomain
) =>
    jwt.sign(
        { userId: user.id, email: user.email, role: user.role, domain },
        JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
    );

const createRefreshToken = async (userId: string, domain: DbAuthDomain): Promise<string> => {
    const rawToken = crypto.randomBytes(48).toString('hex');
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
        data: {
            tokenHash: hashToken(rawToken),
            domain,
            expiresAt,
            userId,
        },
    });

    return rawToken;
};

const revokeRefreshToken = async (rawRefreshToken: string): Promise<void> => {
    await prisma.refreshToken.updateMany({
        where: {
            tokenHash: hashToken(rawRefreshToken),
            revokedAt: null,
        },
        data: {
            revokedAt: new Date(),
        },
    });
};

const isUserLocked = (user: { lockoutUntil: Date | null }): boolean => {
    if (!user.lockoutUntil) {
        return false;
    }

    return user.lockoutUntil > new Date();
};

const registerFailedLoginAttempt = async (user: { id: string; failedLoginAttempts: number }): Promise<void> => {
    const nextAttemptCount = user.failedLoginAttempts + 1;
    const shouldLock = nextAttemptCount >= MAX_FAILED_LOGIN_ATTEMPTS;

    await prisma.user.update({
        where: { id: user.id },
        data: {
            failedLoginAttempts: shouldLock ? 0 : nextAttemptCount,
            lockoutUntil: shouldLock
                ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000)
                : null,
        },
    });
};

const resetLoginAttemptState = async (userId: string): Promise<void> => {
    await prisma.user.update({
        where: { id: userId },
        data: {
            failedLoginAttempts: 0,
            lockoutUntil: null,
        },
    });
};

const getAuthPayload = (
    user: { id: string; email: string; role: 'CUSTOMER' | 'ADMIN' | 'STAFF' },
    domain: TokenDomain
) => ({
    token: createAccessToken(user, domain),
    refreshToken: null as string | null,
});

const issueAuthTokens = async (
    user: { id: string; email: string; role: 'CUSTOMER' | 'ADMIN' | 'STAFF' },
    tokenDomain: TokenDomain,
    dbDomain: DbAuthDomain
) => {
    const payload = getAuthPayload(user, tokenDomain);
    payload.refreshToken = await createRefreshToken(user.id, dbDomain);
    return payload;
};

const isAdminRole = (role: 'CUSTOMER' | 'ADMIN' | 'STAFF') => role === 'ADMIN' || role === 'STAFF';

const tryIssueLockoutResponse = (
    user: { lockoutUntil: Date | null },
    res: Response
): boolean => {
    if (!isUserLocked(user)) {
        return false;
    }

    res.status(423).json({
        message: 'Account temporarily locked due to repeated failed logins',
        lockoutUntil: user.lockoutUntil,
    });

    return true;
};

export const customerRegister = async (req: Request, res: Response): Promise<void> => {
    try {
        const parsed = customerRegisterSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                message: 'Invalid request payload',
                errors: parsed.error.flatten(),
            });
            return;
        }

        const { email, password, name, phone } = parsed.data;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        const existingPhone = await prisma.user.findFirst({ where: { phone } });
        if (existingPhone) {
            res.status(400).json({ message: 'Phone already exists' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                phone,
                role: 'CUSTOMER',
            },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                city: true,
                createdAt: true,
                role: true,
            }
        });

        const { token, refreshToken } = await issueAuthTokens(user, 'customer', 'CUSTOMER');

        res.status(201).json({
            message: 'Customer registered successfully',
            token,
            refreshToken,
            user: toPublicCustomer(user),
        });
    } catch (error) {
        res.status(500).json({ message: 'Error registering customer', error });
    }
};

export const customerLogin = async (req: Request, res: Response): Promise<void> => {
    try {
        const parsed = customerLoginSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                message: 'Invalid request payload',
                errors: parsed.error.flatten(),
            });
            return;
        }

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || user.role !== 'CUSTOMER') {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        if (tryIssueLockoutResponse(user, res)) {
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            await registerFailedLoginAttempt(user);
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        await resetLoginAttemptState(user.id);

        const { token, refreshToken } = await issueAuthTokens(user, 'customer', 'CUSTOMER');

        res.json({
            message: 'Customer login successful',
            token,
            refreshToken,
            user: toPublicCustomer(user),
        });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in customer', error });
    }
};

export const adminLogin = async (req: Request, res: Response): Promise<void> => {
    try {
        const parsed = adminLoginSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                message: 'Invalid request payload',
                errors: parsed.error.flatten(),
            });
            return;
        }

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !isAdminRole(user.role)) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        if (tryIssueLockoutResponse(user, res)) {
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            await registerFailedLoginAttempt(user);
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        await resetLoginAttemptState(user.id);

        const { token, refreshToken } = await issueAuthTokens(user, 'admin', 'ADMIN');

        res.json({
            message: 'Admin login successful',
            token,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in admin', error });
    }
};

export const refreshCustomerToken = async (req: Request, res: Response): Promise<void> => {
    try {
        const parsed = refreshTokenSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                message: 'Invalid request payload',
                errors: parsed.error.flatten(),
            });
            return;
        }

        const tokenHash = hashToken(parsed.data.refreshToken);
        const refreshTokenRecord = await prisma.refreshToken.findFirst({
            where: {
                tokenHash,
                domain: 'CUSTOMER',
                revokedAt: null,
                expiresAt: { gt: new Date() },
            },
            include: {
                user: true,
            },
        });

        if (!refreshTokenRecord || refreshTokenRecord.user.role !== 'CUSTOMER') {
            res.status(401).json({ message: 'Invalid refresh token' });
            return;
        }

        await revokeRefreshToken(parsed.data.refreshToken);
        const { token, refreshToken } = await issueAuthTokens(refreshTokenRecord.user, 'customer', 'CUSTOMER');

        res.json({
            message: 'Token refreshed successfully',
            token,
            refreshToken,
            user: toPublicCustomer(refreshTokenRecord.user),
        });
    } catch (error) {
        res.status(500).json({ message: 'Error refreshing customer token', error });
    }
};

export const refreshAdminToken = async (req: Request, res: Response): Promise<void> => {
    try {
        const parsed = refreshTokenSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                message: 'Invalid request payload',
                errors: parsed.error.flatten(),
            });
            return;
        }

        const tokenHash = hashToken(parsed.data.refreshToken);
        const refreshTokenRecord = await prisma.refreshToken.findFirst({
            where: {
                tokenHash,
                domain: 'ADMIN',
                revokedAt: null,
                expiresAt: { gt: new Date() },
            },
            include: {
                user: true,
            },
        });

        if (!refreshTokenRecord || !isAdminRole(refreshTokenRecord.user.role)) {
            res.status(401).json({ message: 'Invalid refresh token' });
            return;
        }

        await revokeRefreshToken(parsed.data.refreshToken);
        const { token, refreshToken } = await issueAuthTokens(refreshTokenRecord.user, 'admin', 'ADMIN');

        res.json({
            message: 'Token refreshed successfully',
            token,
            refreshToken,
            user: {
                id: refreshTokenRecord.user.id,
                email: refreshTokenRecord.user.email,
                name: refreshTokenRecord.user.name,
                role: refreshTokenRecord.user.role,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Error refreshing admin token', error });
    }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
    try {
        const parsed = refreshTokenSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                message: 'Invalid request payload',
                errors: parsed.error.flatten(),
            });
            return;
        }

        await revokeRefreshToken(parsed.data.refreshToken);
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error logging out', error });
    }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const parsed = forgotPasswordSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                message: 'Invalid request payload',
                errors: parsed.error.flatten(),
            });
            return;
        }

        const { email } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email } });

        const genericResponse: { message: string; resetToken?: string } = {
            message: 'If the email exists, a reset link has been generated.',
        };

        if (!user) {
            res.json(genericResponse);
            return;
        }

        const rawResetToken = crypto.randomBytes(48).toString('hex');
        const tokenHash = hashToken(rawResetToken);
        const expiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_MINUTES * 60 * 1000);

        await prisma.$transaction([
            prisma.passwordResetToken.updateMany({
                where: {
                    userId: user.id,
                    usedAt: null,
                    expiresAt: { gt: new Date() },
                },
                data: { usedAt: new Date() },
            }),
            prisma.passwordResetToken.create({
                data: {
                    userId: user.id,
                    tokenHash,
                    expiresAt,
                },
            }),
        ]);

        if (process.env.NODE_ENV !== 'production') {
            genericResponse.resetToken = rawResetToken;
        }

        res.json(genericResponse);
    } catch (error) {
        res.status(500).json({ message: 'Error initiating password reset', error });
    }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const parsed = resetPasswordSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                message: 'Invalid request payload',
                errors: parsed.error.flatten(),
            });
            return;
        }

        const { token, newPassword } = parsed.data;
        const tokenHash = hashToken(token);

        const resetToken = await prisma.passwordResetToken.findFirst({
            where: {
                tokenHash,
                usedAt: null,
                expiresAt: { gt: new Date() },
            },
            include: {
                user: true,
            },
        });

        if (!resetToken) {
            res.status(400).json({ message: 'Invalid or expired reset token' });
            return;
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const now = new Date();

        await prisma.$transaction([
            prisma.user.update({
                where: { id: resetToken.userId },
                data: {
                    password: hashedPassword,
                    failedLoginAttempts: 0,
                    lockoutUntil: null,
                },
            }),
            prisma.passwordResetToken.update({
                where: { id: resetToken.id },
                data: { usedAt: now },
            }),
            prisma.refreshToken.updateMany({
                where: {
                    userId: resetToken.userId,
                    revokedAt: null,
                },
                data: {
                    revokedAt: now,
                },
            }),
        ]);

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        res.status(500).json({ message: 'Error resetting password', error });
    }
};

export const getCustomerMe = async (req: Request, res: Response): Promise<void> => {
    try {
        const authUser = (req as Request & { user?: { userId: string } }).user;
        if (!authUser?.userId) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: authUser.userId },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                city: true,
                createdAt: true,
                role: true,
            }
        });

        if (!user || user.role !== 'CUSTOMER') {
            res.status(404).json({ message: 'Customer not found' });
            return;
        }

        res.json({ user: toPublicCustomer(user) });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching customer profile', error });
    }
};

export const updateCustomerProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const authUser = (req as Request & { user?: { userId: string } }).user;
        if (!authUser?.userId) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }

        const parsed = updateCustomerProfileSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                message: 'Invalid request payload',
                errors: parsed.error.flatten(),
            });
            return;
        }

        const { name, phone, city } = parsed.data;

        if (phone) {
            const phoneOwner = await prisma.user.findFirst({
                where: { phone, id: { not: authUser.userId } },
                select: { id: true },
            });
            if (phoneOwner) {
                res.status(400).json({ message: 'Phone already exists' });
                return;
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: authUser.userId },
            data: {
                name,
                phone,
                city,
            },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                city: true,
                createdAt: true,
                role: true,
            }
        });

        if (updatedUser.role !== 'CUSTOMER') {
            res.status(403).json({ message: 'Customer access required' });
            return;
        }

        res.json({
            message: 'Profile updated successfully',
            user: toPublicCustomer(updatedUser),
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating customer profile', error });
    }
};

export const getAdminMe = async (req: Request, res: Response): Promise<void> => {
    try {
        const authUser = (req as Request & { user?: { userId: string } }).user;
        if (!authUser?.userId) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: authUser.userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            }
        });

        if (!user || (user.role !== 'ADMIN' && user.role !== 'STAFF')) {
            res.status(404).json({ message: 'Admin not found' });
            return;
        }

        res.json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching admin profile', error });
    }
};

export const updateAdminPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const authUser = (req as Request & { user?: { userId: string } }).user;
        if (!authUser?.userId) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }

        const parsed = updateAdminPasswordSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                message: 'Invalid request payload',
                errors: parsed.error.flatten(),
            });
            return;
        }

        const { currentPassword, newPassword } = parsed.data;

        const user = await prisma.user.findUnique({
            where: { id: authUser.userId },
            select: {
                id: true,
                email: true,
                password: true,
                role: true,
            },
        });

        if (!user || !isAdminRole(user.role)) {
            res.status(403).json({ message: 'Admin access required' });
            return;
        }

        const passwordValid = await bcrypt.compare(currentPassword, user.password);
        if (!passwordValid) {
            res.status(401).json({ message: 'Current password is incorrect' });
            return;
        }

        const samePassword = await bcrypt.compare(newPassword, user.password);
        if (samePassword) {
            res.status(400).json({ message: 'New password must be different from current password' });
            return;
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        const now = new Date();

        await prisma.$transaction([
            prisma.user.update({
                where: { id: user.id },
                data: {
                    password: hashedNewPassword,
                    failedLoginAttempts: 0,
                    lockoutUntil: null,
                },
            }),
            prisma.refreshToken.updateMany({
                where: {
                    userId: user.id,
                    domain: 'ADMIN',
                    revokedAt: null,
                },
                data: {
                    revokedAt: now,
                },
            }),
        ]);

        res.json({ message: 'Password updated successfully. Please log in again.' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating admin password', error });
    }
};
