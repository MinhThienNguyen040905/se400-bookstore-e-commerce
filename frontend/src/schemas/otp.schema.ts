// src/schemas/otp.schema.ts
import { z } from 'zod';

export const requestOTPSchema = z.object({
    email: z.string().email('Invalid email address'),
});

export const verifyOTPSchema = z.object({
    email: z.string().email(),
    otp: z.string().length(6, 'OTP must be 6 characters'),
});

export const completeRegisterSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

export const resetPasswordSchema = z.object({
    email: z.string().email(),
    otp: z.string().length(6),
    newPassword: z.string().min(6),
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

export type RequestOTPData = z.infer<typeof requestOTPSchema>;
export type VerifyOTPData = z.infer<typeof verifyOTPSchema>;
export type CompleteRegisterData = z.infer<typeof completeRegisterSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;