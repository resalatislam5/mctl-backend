import { Router } from 'express';
import appConfigController from '../api/v1/appConfig/appConfig.controller';
import { authenticate } from '../middleware/authenticate';
import { checkPermissionMiddleware } from '../middleware/check.permission.middleware';
import { upload } from '../utils/multer ';

const appConfigRoutes: Router = Router()
  .get(
    '/',
    authenticate,
    checkPermissionMiddleware('APP_CONFIG', 'can_read'),
    appConfigController.findAll,
  )
  .put(
    '/',
    authenticate,
    upload.fields([
      { name: 'logo', maxCount: 1 },
      { name: 'favicon', maxCount: 1 },
    ]),
    checkPermissionMiddleware('APP_CONFIG', 'can_update'),
    appConfigController.update,
  );

export default appConfigRoutes;
