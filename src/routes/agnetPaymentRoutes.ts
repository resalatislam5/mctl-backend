import { Router } from 'express';
import agentPaymentController from '../api/v1/agentPayment/agentPayment.controller';
import { authenticate } from '../middleware/authenticate';
import { checkPermissionMiddleware } from '../middleware/check.permission.middleware';

const agentPaymentRoutes: Router = Router()
  .get(
    '/',
    authenticate,
    checkPermissionMiddleware('AGENT_PAYMENT', 'can_read'),
    agentPaymentController.findAll,
  )
  .get('/select', authenticate, agentPaymentController.select)
  .get(
    '/:_id',
    authenticate,
    checkPermissionMiddleware('AGENT_PAYMENT', 'can_read'),
    agentPaymentController.findSingle,
  )
  .post(
    '/',
    authenticate,
    checkPermissionMiddleware('AGENT_PAYMENT', 'can_create'),
    agentPaymentController.create,
  )
  .patch(
    '/:_id',
    authenticate,
    checkPermissionMiddleware('AGENT_PAYMENT', 'can_update'),
    agentPaymentController.update,
  )
  .delete(
    '/:_id',
    authenticate,
    checkPermissionMiddleware('AGENT_PAYMENT', 'can_delete'),
    agentPaymentController.deleteItem,
  );

export default agentPaymentRoutes;
