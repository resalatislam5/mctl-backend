import { Router } from 'express';
import roleController from '../api/v1/role/role.controller';
import { authenticate } from '../middleware/authenticate';

const roleRoutes: Router = Router()
  .get('/', authenticate, roleController.findAll)
  .get('/select', authenticate, roleController.select)
  .get('/:_id', authenticate, roleController.findSingle)
  .post('/', authenticate, roleController.create)
  .patch('/:_id', authenticate, roleController.update)
  .delete('/:_id', authenticate, roleController.deleteItem);

export default roleRoutes;
