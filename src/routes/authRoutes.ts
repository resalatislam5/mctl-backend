import { Router } from 'express';
import authController from '../api/v1/auth/auth.controller';

const authRoutes: Router = Router().post('/login', authController.login);

export default authRoutes;
