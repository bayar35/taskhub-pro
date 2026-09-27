import { z } from 'zod';

export const createTodoSchema = z.object({
  text: z
    .string()
    .min(1, 'Текст шаардлагатай')
    .max(500, '500 тэмдэгтээс бага'),
  category: z.enum(['Хувийн', 'Ажил', 'Хичээл']).default('Хувийн'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  dueDate: z.string().optional().or(z.literal('')),
  tags: z.array(z.string()).max(5).optional(),
});

export const updateTodoSchema = createTodoSchema.partial().extend({
  completed: z.boolean().optional(),
});

// Query параметрүүдийг validate хийх schema
export const todoQuerySchema = z.object({
  search: z.string().max(100, '100 тэмдэгтээс бага').trim().optional(),
  category: z.enum(['Хувийн', 'Ажил', 'Хичээл']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  completed: z
    .enum(['true', 'false'])
    .optional()
    .transform((val) => (val === undefined ? undefined : val === 'true')),
  sort: z
    .enum([
      'createdAt',
      '-createdAt',
      'priority',
      '-priority',
      'dueDate',
      '-dueDate',
    ])
    .optional()
    .default('-createdAt'),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;
export type TodoQueryInput = z.infer<typeof todoQuerySchema>;