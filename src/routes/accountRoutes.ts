import { Router } from 'express';
import accountController from '../api/v1/account/account.controller';
import { authenticate } from '../middleware/authenticate';
import { checkPermissionMiddleware } from '../middleware/check.permission.middleware';

const accountRoutes: Router = Router()
  .get(
    '/',
    authenticate,
    checkPermissionMiddleware('ACCOUNT', 'can_read'),
    accountController.findAll,
  )
  .get('/select', authenticate, accountController.select)
  .get(
    '/:_id',
    authenticate,
    checkPermissionMiddleware('ACCOUNT', 'can_read'),
    accountController.findSingle,
  )
  .post(
    '/',
    authenticate,
    checkPermissionMiddleware('ACCOUNT', 'can_create'),
    accountController.create,
  )
  .patch(
    '/:_id',
    authenticate,
    checkPermissionMiddleware('ACCOUNT', 'can_update'),
    accountController.update,
  )
  .delete(
    '/:_id',
    authenticate,
    checkPermissionMiddleware('ACCOUNT', 'can_delete'),
    accountController.deleteItem,
  );

export default accountRoutes;
