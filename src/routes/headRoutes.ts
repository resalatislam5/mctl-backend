import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import headController from '../api/v1/head/head.controller';
import { checkPermissionMiddleware } from '../middleware/check.permission.middleware';
const headRoutes: Router = Router()
  .get(
    '/',
    authenticate,
    checkPermissionMiddleware('HEAD', 'can_read'),
    headController.findAll,
  )
  .get('/select', authenticate, headController.select)
  .get(
    '/:_id',
    authenticate,
    checkPermissionMiddleware('HEAD', 'can_read'),
    headController.findSingle,
  )
  .post(
    '/',
    authenticate,
    checkPermissionMiddleware('HEAD', 'can_create'),
    headController.create,
  );
//   .patch('/:_id', authenticate, headController.update)
//   .delete('/:_id', authenticate, headController.deleteItem);

export default headRoutes;
