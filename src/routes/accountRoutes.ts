import { Router } from 'express';
import accountController from '../api/v1/account/account.controller';
import { authenticate } from '../middleware/authenticate';

const accountRoutes: Router = Router()
  .get('/', authenticate, accountController.findAll)
  .get('/select', authenticate, accountController.select)
  .get('/:_id', authenticate, accountController.findSingle)
  .post('/', authenticate, accountController.create)
  .patch('/:_id', authenticate, accountController.update)
  .delete('/:_id', authenticate, accountController.deleteItem);

export default accountRoutes;
