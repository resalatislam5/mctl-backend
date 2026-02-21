import { Router } from 'express';
import moduleController from '../api/v1/module/module.controller';
import { authenticate } from '../middleware/authenticate';

const moduleRoutes: Router = Router().get(
  '/',
  authenticate,
  moduleController.findAll,
);

export default moduleRoutes;
