import { Router } from 'express';
import agentCommissionController from '../api/v1/agentCommission/agentCommission.controller';
import { authenticate } from '../middleware/authenticate';
import { checkPermissionMiddleware } from '../middleware/check.permission.middleware';

const agentCommissionRoutes: Router = Router()
  .get(
    '/',
    authenticate,
    checkPermissionMiddleware('AGENT_COMMISSION', 'can_read'),
    agentCommissionController.findAll,
  )
  .get('/select', authenticate, agentCommissionController.select)
  .get(
    '/:_id',
    authenticate,
    checkPermissionMiddleware('AGENT_COMMISSION', 'can_read'),
    agentCommissionController.findSingle,
  )
  .post(
    '/',
    authenticate,
    checkPermissionMiddleware('AGENT_COMMISSION', 'can_create'),
    agentCommissionController.generate,
  );

export default agentCommissionRoutes;
