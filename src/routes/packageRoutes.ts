import { Router } from 'express';
import packageController from '../api/v1/Package/package.controller';
import { authenticate } from '../middleware/authenticate';

const packageRoutes: Router = Router()
  .get('/', authenticate, packageController.findAll)
  .get('/select', authenticate, packageController.select)
  .get('/:_id', authenticate, packageController.findSingle)
  .post('/', authenticate, packageController.create)
  .patch('/:_id', authenticate, packageController.update)
  .delete('/:_id', authenticate, packageController.deleteItem);

export default packageRoutes;
