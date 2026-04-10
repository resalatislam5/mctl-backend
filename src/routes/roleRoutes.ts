import { Router } from 'express';
import roleController from '../api/v1/role/role.controller';
import { authenticate } from '../middleware/authenticate';
import { checkPermissionMiddleware } from '../middleware/check.permission.middleware';

const roleRoutes: Router = Router()
  .get(
    '/',
    authenticate,
    checkPermissionMiddleware('ROLE', 'can_read'),
    roleController.findAll,
  )
  .get('/select', authenticate, roleController.select)
  .get(
    '/:_id',
    authenticate,
    checkPermissionMiddleware('ROLE', 'can_read'),
    roleController.findSingle,
  )
  .post(
    '/',
    authenticate,
    checkPermissionMiddleware('ROLE', 'can_create'),
    roleController.create,
  )
  .patch(
    '/:_id',
    authenticate,
    checkPermissionMiddleware('ROLE', 'can_update'),
    roleController.update,
  )
  .delete(
    '/:_id',
    authenticate,
    checkPermissionMiddleware('ROLE', 'can_delete'),
    roleController.deleteItem,
  );

export default roleRoutes;
