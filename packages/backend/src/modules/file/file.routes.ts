import { Router } from 'express';
import * as fileController from './file.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// Бүх route-д authentication шаардана
router.use(authenticate);

// POST /api/v1/files/upload
router.post(
  '/upload',
  fileController.uploadMiddleware,
  fileController.uploadController
);

// GET /api/v1/files
router.get('/', fileController.list);

// DELETE /api/v1/files/:id
router.delete('/:id', fileController.remove);

export default router;