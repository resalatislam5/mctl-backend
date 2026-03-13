import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import headController from '../api/v1/head/head.controller';
const headRoutes: Router = Router()
  .get('/', authenticate, headController.findAll)
  .get('/select', authenticate, headController.select)
  .get('/:_id', authenticate, headController.findSingle)
  .post('/', authenticate, headController.create);
//   .patch('/:_id', authenticate, headController.update)
//   .delete('/:_id', authenticate, headController.deleteItem);

export default headRoutes;
