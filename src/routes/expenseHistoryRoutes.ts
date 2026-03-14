import { Router } from 'express';
import expenseHistoryController from '../api/v1/expenseHistory/expenseHistory.controller';
import { authenticate } from '../middleware/authenticate';

const expenseHistoryRoutes: Router = Router()
  .get('/', authenticate, expenseHistoryController.findAll)
  .get('/select', authenticate, expenseHistoryController.select)
  .get('/:_id', authenticate, expenseHistoryController.findSingle)
  .post('/', authenticate, expenseHistoryController.create)
  .patch('/:_id', authenticate, expenseHistoryController.update)
  .delete('/:_id', authenticate, expenseHistoryController.deleteItem);

export default expenseHistoryRoutes;
