import { Router } from 'express';
import courseProgressController from '../api/v1/course_progress/courseProgress.controller';
import { authenticate } from '../middleware/authenticate';
import { checkPermissionMiddleware } from '../middleware/check.permission.middleware';

const courseProgressRoutes: Router = Router()
  .get(
    '/',
    authenticate,
    checkPermissionMiddleware('COURSE_PROGRESS', 'can_read'),
    courseProgressController.findAll,
  )
  .get(
    '/:_id',
    authenticate,
    checkPermissionMiddleware('COURSE_PROGRESS', 'can_read'),
    courseProgressController.findSingle,
  )
  .post(
    '/',
    authenticate,
    checkPermissionMiddleware('COURSE_PROGRESS', 'can_create'),
    courseProgressController.create,
  )
  .patch(
    '/:_id',
    authenticate,
    checkPermissionMiddleware('COURSE_PROGRESS', 'can_update'),
    courseProgressController.update,
  )
  .delete(
    '/:_id',
    authenticate,
    checkPermissionMiddleware('COURSE_PROGRESS', 'can_delete'),
    courseProgressController.deleteItem,
  )
  .patch(
    '/:_id/status',
    authenticate,
    checkPermissionMiddleware('COURSE_PROGRESS', 'can_update'),
    courseProgressController.updateStatus,
  );

export default courseProgressRoutes;
