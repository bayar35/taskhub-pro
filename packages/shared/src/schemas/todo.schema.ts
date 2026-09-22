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

export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;