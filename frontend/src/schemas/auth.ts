// src/schemas/auth.ts
import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string()
    .min(6, 'Username must be at least 6 characters')
    .max(20, 'Username cannot exceed 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores allowed'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Must contain at least one special character'),
  email: z.string().email('Please enter a valid email address'),
  firstName: z.string().min(1, 'First Name is required'),
  lastName: z.string().min(1, 'Last Name is required'),
  phoneNumber: z.string().regex(/^05[0-9]{8}$/, 'Please enter a valid Saudi phone number (e.g. 0512345678)'),
});

export const loginSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters'),
});

// تصحيح الأخطاء هنا
export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>; 