import { Router } from 'express';
import * as TodoController from './todo.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createTodoSchema, updateTodoSchema } from '@taskhub/shared';

const router = Router();

// Бүх todo route-ууд нэвтрэх шаардлагатай
router.use(authenticate);

/**
 * @swagger
 * /api/v1/todos:
 *   get:
 *     summary: List all todos
 *     tags: [Todos]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by text
 *     responses:
 *       200:
 *         description: List of todos
 *       401:
 *         description: Unauthorized
 */
router.get('/', TodoController.list);

/**
 * @swagger
 * /api/v1/todos/stats:
 *   get:
 *     summary: Get todo statistics
 *     tags: [Todos]
 *     responses:
 *       200:
 *         description: Todo statistics
 */
router.get('/stats', TodoController.stats);

/**
 * @swagger
 * /api/v1/todos:
 *   post:
 *     summary: Create a todo
 *     tags: [Todos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text]
 *             properties:
 *               text:
 *                 type: string
 *                 example: Buy groceries
 *               category:
 *                 type: string
 *                 enum: [personal, work, study]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *     responses:
 *       201:
 *         description: Todo created
 *       400:
 *         description: Validation error
 */
router.post('/', validate(createTodoSchema), TodoController.create);

/**
 * @swagger
 * /api/v1/todos/{id}:
 *   patch:
 *     summary: Update a todo
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *               category:
 *                 type: string
 *               priority:
 *                 type: string
 *     responses:
 *       200:
 *         description: Todo updated
 *       404:
 *         description: Todo not found
 */
router.patch('/:id', validate(updateTodoSchema), TodoController.update);

/**
 * @swagger
 * /api/v1/todos/{id}/toggle:
 *   put:
 *     summary: Toggle todo completion
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Todo toggled
 *       404:
 *         description: Todo not found
 */
router.put('/:id/toggle', TodoController.toggle);

/**
 * @swagger
 * /api/v1/todos/{id}:
 *   delete:
 *     summary: Delete a todo
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Todo deleted
 *       404:
 *         description: Todo not found
 */
router.delete('/:id', TodoController.remove);

export default router;