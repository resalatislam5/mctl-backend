import { Router } from 'express';

import studentController from '../api/v1/student/student.controller';
import { authenticate } from '../middleware/authenticate';
import { upload } from '../utils/multer ';
import { checkPermissionMiddleware } from '../middleware/check.permission.middleware';

const studentRoutes: Router = Router()
  .get(
    '/',
    authenticate,
    checkPermissionMiddleware('STUDENT', 'can_read'),
    studentController.findAll,
  )
  .get('/select', authenticate, studentController.select)
  .get(
    '/:_id',
    authenticate,
    checkPermissionMiddleware('STUDENT', 'can_read'),
    studentController.findSingle,
  )
  .post(
    '/',
    authenticate,
    checkPermissionMiddleware('STUDENT', 'can_create'),
    upload.single('image'),
    studentController.create,
  )
  .patch(
    '/:_id',
    authenticate,
    checkPermissionMiddleware('STUDENT', 'can_update'),
    upload.single('image'),
    studentController.update,
  )
  .delete('/:_id', authenticate, studentController.deleteItem);

export default studentRoutes;
