import { z } from 'zod';

export const customerRegisterSchema = z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().toLowerCase().email(),
    phone: z.string().trim().min(7).max(20),
    password: z.string().min(6).max(72),
});

export const customerLoginSchema = z.object({
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(1),
});

export const adminLoginSchema = z.object({
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(1),
});

export const refreshTokenSchema = z.object({
    refreshToken: z.string().trim().min(20),
});

export const forgotPasswordSchema = z.object({
    email: z.string().trim().toLowerCase().email(),
});

export const resetPasswordSchema = z.object({
    token: z.string().trim().min(20),
    newPassword: z.string().min(8).max(72),
});

export const updateAdminPasswordSchema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8).max(72),
});

export const updateCustomerProfileSchema = z.object({
    name: z.string().trim().min(2).max(100).optional(),
    phone: z.string().trim().min(7).max(20).optional(),
    city: z.string().trim().min(2).max(80).optional(),
}).refine((payload) => Object.keys(payload).length > 0, {
    message: 'At least one field must be provided',
});

export type CustomerRegisterInput = z.infer<typeof customerRegisterSchema>;
export type CustomerLoginInput = z.infer<typeof customerLoginSchema>;
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateAdminPasswordInput = z.infer<typeof updateAdminPasswordSchema>;
export type UpdateCustomerProfileInput = z.infer<typeof updateCustomerProfileSchema>;