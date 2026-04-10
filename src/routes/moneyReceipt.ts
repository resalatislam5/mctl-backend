import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import moneyReceiptController from '../api/v1/money_receipt/moneyReceipt.controller';
import { checkPermissionMiddleware } from '../middleware/check.permission.middleware';

const moneyReceiptRoutes: Router = Router()
  .get(
    '/',
    authenticate,
    checkPermissionMiddleware('MONEY_RECEIPT', 'can_read'),
    moneyReceiptController.findAll,
  )
  .get('/select', authenticate, moneyReceiptController.select)
  .get(
    '/:_id',
    authenticate,
    checkPermissionMiddleware('MONEY_RECEIPT', 'can_read'),
    moneyReceiptController.findSingle,
  )
  .post(
    '/',
    authenticate,
    checkPermissionMiddleware('MONEY_RECEIPT', 'can_create'),
    moneyReceiptController.create,
  )
  .patch(
    '/:_id',
    authenticate,
    checkPermissionMiddleware('MONEY_RECEIPT', 'can_update'),
    moneyReceiptController.update,
  )
  .delete(
    '/:_id',
    authenticate,
    checkPermissionMiddleware('MONEY_RECEIPT', 'can_delete'),
    moneyReceiptController.deleteItem,
  );

export default moneyReceiptRoutes;
