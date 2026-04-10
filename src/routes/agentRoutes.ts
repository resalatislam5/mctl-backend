import { Router } from 'express';
import agentController from '../api/v1/Agent/agent.controller';
import { authenticate } from '../middleware/authenticate';
import { checkPermissionMiddleware } from '../middleware/check.permission.middleware';

const agentRoutes: Router = Router()
  .get(
    '/',
    authenticate,
    checkPermissionMiddleware('AGENT', 'can_read'),
    agentController.findAll,
  )
  .get('/select', authenticate, agentController.select)
  .get(
    '/:_id',
    authenticate,
    checkPermissionMiddleware('AGENT', 'can_read'),
    agentController.findSingle,
  )
  .post(
    '/',
    authenticate,
    checkPermissionMiddleware('AGENT', 'can_create'),
    agentController.create,
  )
  .patch(
    '/:_id',
    authenticate,
    checkPermissionMiddleware('AGENT', 'can_update'),
    agentController.update,
  )
  .delete(
    '/:_id',
    authenticate,
    checkPermissionMiddleware('AGENT', 'can_delete'),
    agentController.deleteItem,
  );

export default agentRoutes;
