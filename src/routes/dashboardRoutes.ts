import { Router } from 'express';
import dashboardController from '../api/v1/dashboard/dashboard.controller';
import { authenticate } from '../middleware/authenticate';
import { checkPermissionMiddleware } from '../middleware/check.permission.middleware';

const dashboardRoutes: Router = Router().get(
  '/',
  authenticate,
  checkPermissionMiddleware('DASHBOARD', 'can_read'),
  dashboardController.getDashboardData,
);

export default dashboardRoutes;
