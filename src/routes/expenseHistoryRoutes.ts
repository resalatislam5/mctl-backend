import { Router } from 'express';
import expenseHistoryController from '../api/v1/expenseHistory/expenseHistory.controller';
import { authenticate } from '../middleware/authenticate';
import { checkPermissionMiddleware } from '../middleware/check.permission.middleware';

const expenseHistoryRoutes: Router = Router()
  .get(
    '/',
    authenticate,
    checkPermissionMiddleware('EXPENSE_HISTORY', 'can_read'),
    expenseHistoryController.findAll,
  )
  .get('/select', authenticate, expenseHistoryController.select)
  .get(
    '/:_id',
    authenticate,
    checkPermissionMiddleware('EXPENSE_HISTORY', 'can_read'),
    expenseHistoryController.findSingle,
  )
  .post(
    '/',
    authenticate,
    checkPermissionMiddleware('EXPENSE_HISTORY', 'can_create'),
    expenseHistoryController.create,
  )
  .patch(
    '/:_id',
    authenticate,
    checkPermissionMiddleware('EXPENSE_HISTORY', 'can_update'),
    expenseHistoryController.update,
  )
  .delete(
    '/:_id',
    authenticate,
    checkPermissionMiddleware('EXPENSE_HISTORY', 'can_delete'),
    expenseHistoryController.deleteItem,
  );

export default expenseHistoryRoutes;
