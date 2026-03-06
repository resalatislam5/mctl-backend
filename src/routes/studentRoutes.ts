import { Router } from 'express';

import studentController from '../api/v1/student/student.controller';
import { authenticate } from '../middleware/authenticate';
import { upload } from '../utils/multer ';

const studentRoutes: Router = Router()
  .get('/', authenticate, studentController.findAll)
  .get('/select', authenticate, studentController.select)
  .get('/:_id', authenticate, studentController.findSingle)
  .post('/', authenticate, upload.single('image'), studentController.create)
  .patch(
    '/:_id',
    authenticate,
    upload.single('image'),
    studentController.update,
  )
  .delete('/:_id', authenticate, studentController.deleteItem);

export default studentRoutes;
