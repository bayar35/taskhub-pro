import { Router } from 'express';
import * as todoController from './todo.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// Бүх route-д authentication шаардана
router.use(authenticate);

router.get('/', todoController.list);
router.get('/stats', todoController.stats);
router.get('/:id', todoController.getOne);
router.post('/', todoController.create);
router.patch('/:id', todoController.update);
router.put('/:id/toggle', todoController.toggle);
router.delete('/:id', todoController.remove);

export default router;