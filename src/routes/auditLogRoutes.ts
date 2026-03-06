import { Router } from 'express';
import auditLogController from '../api/v1/auditLog/auditLog.controller';
import { authenticate } from '../middleware/authenticate';

const auditLogRoutes: Router = Router().get(
  '/',
  authenticate,
  auditLogController.findAll,
);

export default auditLogRoutes;
