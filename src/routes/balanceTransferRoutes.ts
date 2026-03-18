import { Router } from 'express';
import balanceTransferController from '../api/v1/balanceTransfer/balanceTransfer.controller';
import { authenticate } from '../middleware/authenticate';

const balanceTransferRoutes: Router = Router()
  .get('/', authenticate, balanceTransferController.findAll)
  .get('/:_id', authenticate, balanceTransferController.findSingle)
  .post('/', authenticate, balanceTransferController.create)
  .patch('/:_id', authenticate, balanceTransferController.update)
  .delete('/:_id', authenticate, balanceTransferController.deleteItem);

export default balanceTransferRoutes;
