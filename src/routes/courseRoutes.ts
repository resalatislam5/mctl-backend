import { Router } from 'express';
import courseController from '../api/v1/Course/course.controller';
import { authenticate } from '../middleware/authenticate';
import { checkPermissionMiddleware } from '../middleware/check.permission.middleware';

const courseRoutes: Router = Router()
  .get(
    '/',
    authenticate,
    checkPermissionMiddleware('COURSE', 'can_read'),
    courseController.findAll,
  )
  .get('/select', authenticate, courseController.select)
  .get(
    '/:_id',
    authenticate,
    checkPermissionMiddleware('COURSE', 'can_read'),
    courseController.findSingle,
  )
  .post(
    '/',
    authenticate,
    checkPermissionMiddleware('COURSE', 'can_create'),
    courseController.create,
  )
  .patch(
    '/:_id',
    authenticate,
    checkPermissionMiddleware('COURSE', 'can_update'),
    courseController.update,
  )
  .delete(
    '/:_id',
    authenticate,
    checkPermissionMiddleware('COURSE', 'can_delete'),
    courseController.deleteItem,
  );

export default courseRoutes;
