import { Router } from 'express';
import userController from '../api/v1/user/user.controller';
import { authenticate } from '../middleware/authenticate';
const userRoutes: Router = Router()
  .get('/', authenticate, userController.findAll)
  .get('/select', authenticate, userController.select)
  .get('/:_id', authenticate, userController.findOne)
  .post('/', authenticate, userController.create)
  .patch('/:_id', authenticate, userController.update)
  .delete('/:_id', authenticate, userController.deleteOne);

export default userRoutes;
