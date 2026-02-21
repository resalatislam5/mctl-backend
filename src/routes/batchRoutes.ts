import { Router } from 'express';
import batchController from '../api/v1/batch/batch.controller';
import { authenticate } from '../middleware/authenticate';

const batchRoutes: Router = Router()
  .get('/', authenticate, batchController.findAll)
  .get('/select', authenticate, batchController.select)
  .get('/:_id', authenticate, batchController.findSingle)
  .post('/', authenticate, batchController.create)
  .patch('/:_id', authenticate, batchController.update)
  .delete('/:_id', authenticate, batchController.deleteItem);

export default batchRoutes;
