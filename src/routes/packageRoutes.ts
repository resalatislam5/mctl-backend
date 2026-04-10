import { Router } from 'express';
import packageController from '../api/v1/package_new/package.controller';
import { authenticate } from '../middleware/authenticate';
import { checkPermissionMiddleware } from '../middleware/check.permission.middleware';

const packageRoutes: Router = Router()
  .get(
    '/',
    authenticate,
    checkPermissionMiddleware('PACKAGE', 'can_read'),
    packageController.findAll,
  )
  .get('/select', authenticate, packageController.select)
  .get(
    '/:_id',
    authenticate,
    checkPermissionMiddleware('PACKAGE', 'can_read'),
    packageController.findSingle,
  )
  .post(
    '/',
    authenticate,
    checkPermissionMiddleware('PACKAGE', 'can_create'),
    packageController.create,
  )
  .patch(
    '/:_id',
    authenticate,
    checkPermissionMiddleware('PACKAGE', 'can_update'),
    packageController.update,
  )
  .delete(
    '/:_id',
    authenticate,
    checkPermissionMiddleware('PACKAGE', 'can_delete'),
    packageController.deleteItem,
  );

export default packageRoutes;
