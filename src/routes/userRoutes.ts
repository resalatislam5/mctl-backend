import { Router } from 'express';
import userController from '../api/v1/user/user.controller';
import { authenticate } from '../middleware/authenticate';
import { checkPermissionMiddleware } from '../middleware/check.permission.middleware';
const userRoutes: Router = Router()
  .get(
    '/',
    authenticate,
    checkPermissionMiddleware('USER', 'can_read'),
    userController.findAll,
  )
  .get('/select', authenticate, userController.select)
  .get(
    '/:_id',
    authenticate,
    checkPermissionMiddleware('USER', 'can_read'),
    userController.findOne,
  )
  .post(
    '/',
    authenticate,
    checkPermissionMiddleware('USER', 'can_create'),
    userController.create,
  )
  .patch(
    '/:_id',
    authenticate,
    checkPermissionMiddleware('USER', 'can_update'),
    userController.update,
  )
  .delete(
    '/:_id',
    authenticate,
    checkPermissionMiddleware('USER', 'can_delete'),
    userController.deleteOne,
  );

export default userRoutes;
