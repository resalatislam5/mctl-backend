import { Router } from 'express';

import { authenticate } from '../middleware/authenticate';
import divisionController from '../api/v1/division/division.controller';

const divisionRoutes: Router = Router()
  .get('/', authenticate, divisionController.findAll)
  .get('/select', authenticate, divisionController.select)
  .get('/:_id', authenticate, divisionController.findSingle)
  .post('/', authenticate, divisionController.create)
  .patch('/:_id', authenticate, divisionController.update)
  .delete('/:_id', authenticate, divisionController.deleteItem);

export default divisionRoutes;
