import { Router } from 'express';
import upazilaController from '../api/v1/upazila/upazila.controller';
import { authenticate } from '../middleware/authenticate';
import {
  cacheInvalidateMiddleware,
  cacheMiddleware,
} from '../middleware/cache.middleware';

const upazilaRoutes: Router = Router()
  .get('/', authenticate, cacheMiddleware(), upazilaController.findAll)
  .get('/select', authenticate, cacheMiddleware(), upazilaController.select)
  .get('/:_id', authenticate, cacheMiddleware(), upazilaController.findSingle)
  .post(
    '/',
    authenticate,
    cacheInvalidateMiddleware(),
    upazilaController.create,
  )
  .patch(
    '/:_id',
    authenticate,
    cacheInvalidateMiddleware(),
    upazilaController.update,
  )
  .delete(
    '/:_id',
    authenticate,
    cacheInvalidateMiddleware(),
    upazilaController.deleteItem,
  );

export default upazilaRoutes;
