import { Router } from 'express';
import userController from '../api/v1/user/user.controller';
import { authenticate } from '../middleware/authenticate';
const userRoutes: Router = Router()
  .get('/', authenticate, userController.findAll)
  .get('/select', authenticate, userController.select)
  .get('/:_id', authenticate, userController.findOne)
  .post('/', userController.create)
  .patch('/:_id', userController.update)
  .delete('/:_id', userController.deleteOne);

export default userRoutes;
