import { Router } from 'express';
import courseController from '../api/v1/Course/course.controller';
import { authenticate } from '../middleware/authenticate';

const courseRoutes: Router = Router()
  .get('/', authenticate, courseController.findAll)
  .get('/select', authenticate, courseController.select)
  .get('/:_id', authenticate, courseController.findSingle)
  .post('/', authenticate, courseController.create)
  .patch('/:_id', authenticate, courseController.update)
  .delete('/:_id', authenticate, courseController.deleteItem);

export default courseRoutes;
