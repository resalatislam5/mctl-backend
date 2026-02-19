import { Router } from 'express';
import countryController from '../api/v1/country/country.controller';

const countryRoutes: Router = Router()
  .get('/', countryController.findAll)
  .get('/:id', countryController.findSingle)
  .post('/', countryController.create)
  .patch('/:id', countryController.update);

export default countryRoutes;
