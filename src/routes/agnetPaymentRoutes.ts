import { Router } from 'express';
import agentPaymentController from '../api/v1/agentPayment/agentPayment.controller';
import { authenticate } from '../middleware/authenticate';

const agentPaymentRoutes: Router = Router()
  .get('/', authenticate, agentPaymentController.findAll)
  .get('/select', authenticate, agentPaymentController.select)
  .get('/:_id', authenticate, agentPaymentController.findSingle)
  .post('/', authenticate, agentPaymentController.create)
  .patch('/:_id', authenticate, agentPaymentController.update)
  .delete('/:_id', authenticate, agentPaymentController.deleteItem);

export default agentPaymentRoutes;
