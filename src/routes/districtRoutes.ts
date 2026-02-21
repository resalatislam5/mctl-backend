import { Router } from 'express';

import { authenticate } from '../middleware/authenticate';
import districtController from '../api/v1/district/district.controller';
const districtRoutes: Router = Router()
  .get('/', authenticate, districtController.findAll)
  .get('/select', authenticate, districtController.select)
  .get('/:_id', authenticate, districtController.findSingle)
  .post('/', authenticate, districtController.create)
  .patch('/:_id', authenticate, districtController.update)
  .delete('/:_id', authenticate, districtController.deleteItem);

export default districtRoutes;
