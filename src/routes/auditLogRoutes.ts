import { Router } from 'express';
import auditLogController from '../api/v1/auditLog/auditLog.controller';
import { authenticate } from '../middleware/authenticate';
import { checkPermissionMiddleware } from '../middleware/check.permission.middleware';

const auditLogRoutes: Router = Router().get(
  '/',
  authenticate,
  checkPermissionMiddleware('AUDIT', 'can_read'),
  auditLogController.findAll,
);

export default auditLogRoutes;
