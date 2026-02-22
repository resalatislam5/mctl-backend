import { Router } from 'express';
import agentController from '../api/v1/Agent/agent.controller';
import { authenticate } from '../middleware/authenticate';

const agentRoutes: Router = Router()
  .get('/', authenticate, agentController.findAll)
  .get('/select', authenticate, agentController.select)
  .get('/:_id', authenticate, agentController.findSingle)
  .post('/', authenticate, agentController.create)
  .patch('/:_id', authenticate, agentController.update)
  .delete('/:_id', authenticate, agentController.deleteItem);

export default agentRoutes;
