import { Router } from 'express';
import enrollmentController from '../api/v1/enrollment/enrollment.controller';
import { authenticate } from '../middleware/authenticate';
import { checkPermissionMiddleware } from '../middleware/check.permission.middleware';

const enrollmentRoutes: Router = Router()
  .get(
    '/',
    authenticate,
    checkPermissionMiddleware('ENROLLMENT', 'can_read'),
    enrollmentController.findAll,
  )
  .get('/select', authenticate, enrollmentController.select)
  .get(
    '/:_id',
    authenticate,
    checkPermissionMiddleware('ENROLLMENT', 'can_read'),
    enrollmentController.findSingle,
  )
  .post(
    '/',
    authenticate,
    checkPermissionMiddleware('ENROLLMENT', 'can_create'),
    enrollmentController.create,
  )
  .patch(
    '/:_id',
    authenticate,
    checkPermissionMiddleware('ENROLLMENT', 'can_update'),
    enrollmentController.update,
  )
  .delete(
    '/:_id',
    authenticate,
    checkPermissionMiddleware('ENROLLMENT', 'can_delete'),
    enrollmentController.deleteItem,
  );

export default enrollmentRoutes;
