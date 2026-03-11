import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import moneyReceiptController from '../api/v1/money_receipt/moneyReceipt.controller';

const moneyReceiptRoutes: Router = Router()
  .get('/', authenticate, moneyReceiptController.findAll)
  .get('/select', authenticate, moneyReceiptController.select)
  .get('/:_id', authenticate, moneyReceiptController.findSingle)
  .post('/', authenticate, moneyReceiptController.create)
  .patch('/:_id', authenticate, moneyReceiptController.update)
  .delete('/:_id', authenticate, moneyReceiptController.deleteItem);

export default moneyReceiptRoutes;
