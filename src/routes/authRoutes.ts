import { Router } from 'express';
import authController from '../api/v1/auth/auth.controller';
import { authenticate } from '../middleware/authenticate';

const authRoutes: Router = Router()
  .post('/auth/login', authController.login)
  .get('/check', authenticate, authController.check);

export default authRoutes;
