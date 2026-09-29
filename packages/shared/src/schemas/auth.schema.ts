import { z } from 'zod';

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Хэрэглэгчийн нэр 3+ тэмдэгт байх ёстой')
    .max(50, '50 тэмдэгтээс бага')
    .trim(),
  email: z.string().email('Зөв и-мэйл оруулна уу').optional(),
  password: z
    .string()
    .min(8, 'Нууц үг 8+ тэмдэгт байх ёстой')
    .max(100, '100 тэмдэгтээс бага'),
});

export const loginSchema = z.object({
  username: z.string().min(1, 'Хэрэглэгчийн нэр шаардлагатай'),
  password: z.string().min(1, 'Нууц үг шаардлагатай'),
  twoFactorToken: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;