import { Router } from 'express';
import enrollmentController from '../api/v1/enrollment/enrollment.controller';
import { authenticate } from '../middleware/authenticate';

const enrollmentRoutes: Router = Router()
  .get('/', authenticate, enrollmentController.findAll)
  .get('/select', authenticate, enrollmentController.select)
  .get('/:_id', authenticate, enrollmentController.findSingle)
  .post('/', authenticate, enrollmentController.create)
  .patch('/:_id', authenticate, enrollmentController.update)
  .delete('/:_id', authenticate, enrollmentController.deleteItem);

export default enrollmentRoutes;
