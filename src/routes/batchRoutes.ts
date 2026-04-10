import { Router } from 'express';
import batchController from '../api/v1/batch/batch.controller';
import { authenticate } from '../middleware/authenticate';
import { checkPermissionMiddleware } from '../middleware/check.permission.middleware';

const batchRoutes: Router = Router()
  .get(
    '/',
    authenticate,
    checkPermissionMiddleware('BATCH', 'can_read'),
    batchController.findAll,
  )
  .get('/select', authenticate, batchController.select)
  .get(
    '/:_id',
    authenticate,
    checkPermissionMiddleware('BATCH', 'can_read'),
    batchController.findSingle,
  )
  .post(
    '/',
    authenticate,
    checkPermissionMiddleware('BATCH', 'can_create'),
    batchController.create,
  )
  .patch(
    '/:_id',
    authenticate,
    checkPermissionMiddleware('BATCH', 'can_update'),
    batchController.update,
  )
  .delete(
    '/:_id',
    authenticate,
    checkPermissionMiddleware('BATCH', 'can_delete'),
    batchController.deleteItem,
  );

export default batchRoutes;
