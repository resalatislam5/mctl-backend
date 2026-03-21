import { Router } from 'express';
import agentCommissionController from '../api/v1/agentCommission/agentCommission.controller';
import { authenticate } from '../middleware/authenticate';

const agentCommissionRoutes: Router = Router()
  .get('/', authenticate, agentCommissionController.findAll)
  .get('/select', authenticate, agentCommissionController.select)
  .get('/:_id', authenticate, agentCommissionController.findSingle)
  .post('/', authenticate, agentCommissionController.generate);

export default agentCommissionRoutes;
