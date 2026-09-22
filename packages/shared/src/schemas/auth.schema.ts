import { z } from 'zod';

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Хэрэглэгчийн нэр дор хаяж 3 тэмдэгт')
    .max(30, 'Хэрэглэгчийн нэр 30 тэмдэгтээс бага')
    .regex(/^[a-zA-Z0-9_]+$/, 'Зөвхөн үсэг, тоо, _ агуулна'),
  email: z.string().email('Имэйл хаяг буруу').optional().or(z.literal('')),
  password: z
    .string()
    .min(8, 'Нууц үг дор хаяж 8 тэмдэгт')
    .regex(/[A-Z]/, 'Дор хаяж нэг том үсэг')
    .regex(/[a-z]/, 'Дор хаяж нэг жижиг үсэг')
    .regex(/[0-9]/, 'Дор хаяж нэг тоо')
    .regex(/[^A-Za-z0-9]/, 'Дор хаяж нэг тусгай тэмдэгт'),
});

export const loginSchema = z.object({
  username: z.string().min(1, 'Хэрэглэгчийн нэр шаардлагатай'),
  password: z.string().min(1, 'Нууц үг шаардлагатай'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;