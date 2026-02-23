import rateLimit from 'express-rate-limit';

const buildLimiter = (windowMs: number, max: number) =>
    rateLimit({
        windowMs,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
            message: 'Too many requests. Please try again later.',
        },
    });

export const authLoginRateLimiter = buildLimiter(15 * 60 * 1000, 10);
export const passwordResetRateLimiter = buildLimiter(15 * 60 * 1000, 5);
