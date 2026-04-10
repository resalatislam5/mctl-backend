import { Router } from 'express';
import balanceTransferController from '../api/v1/balanceTransfer/balanceTransfer.controller';
import { authenticate } from '../middleware/authenticate';
import { checkPermissionMiddleware } from '../middleware/check.permission.middleware';

const balanceTransferRoutes: Router = Router()
  .get(
    '/',
    authenticate,
    checkPermissionMiddleware('BALANCE_TRANSFER', 'can_read'),
    balanceTransferController.findAll,
  )
  .get(
    '/:_id',
    authenticate,
    checkPermissionMiddleware('BALANCE_TRANSFER', 'can_read'),
    balanceTransferController.findSingle,
  )
  .post(
    '/',
    authenticate,
    checkPermissionMiddleware('BALANCE_TRANSFER', 'can_create'),
    balanceTransferController.create,
  )
  .patch(
    '/:_id',
    authenticate,
    checkPermissionMiddleware('BALANCE_TRANSFER', 'can_update'),
    balanceTransferController.update,
  )
  .delete(
    '/:_id',
    authenticate,
    checkPermissionMiddleware('BALANCE_TRANSFER', 'can_delete'),
    balanceTransferController.deleteItem,
  );

export default balanceTransferRoutes;
