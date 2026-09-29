import { Router } from 'express';
import * as todoController from './todo.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';

const router = Router();

// Бүх route-д authentication шаардана
router.use(authenticate);

router.get('/', todoController.list);
router.get('/stats', todoController.stats);
router.get('/:id', todoController.getOne);
router.post('/', requirePermission('todo:create'), todoController.create);
router.patch('/:id', todoController.update);
router.put('/:id/toggle', todoController.toggle);
router.delete('/:id', requirePermission('todo:delete'),todoController.remove);

export default router;