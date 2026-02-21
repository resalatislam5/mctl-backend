import { Router } from 'express';
import countryController from '../api/v1/country/country.controller';
import { authenticate } from '../middleware/authenticate';

const countryRoutes: Router = Router()
  .get('/', authenticate, countryController.findAll)
  .get('/select', authenticate, countryController.findAll)
  .get('/:_id', authenticate, countryController.findSingle)
  .post('/', authenticate, countryController.create)
  .patch('/:_id', authenticate, countryController.update)
  .delete('/:_id', authenticate, countryController.deleteItem);

export default countryRoutes;
