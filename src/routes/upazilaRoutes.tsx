import { Router } from 'express';
import upazilaController from '../api/v1/upazila/upazila.controller';
import { authenticate } from '../middleware/authenticate';

const upazilaRoutes: Router = Router()
  .get('/', authenticate, upazilaController.findAll)
  .get('/select', authenticate, upazilaController.select)
  .get('/:_id', authenticate, upazilaController.findSingle)
  .post('/', authenticate, upazilaController.create)
  .patch('/:_id', authenticate, upazilaController.update)
  .delete('/:_id', authenticate, upazilaController.deleteItem);

export default upazilaRoutes;
