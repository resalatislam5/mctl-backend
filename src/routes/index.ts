import { Router } from 'express';
import userRoutes from './userRoutes';
import countryRoutes from './countryRoutes';
import authRoutes from './authRoutes';

const router: Router = Router();
router.use('/v1/user', userRoutes);
router.use('/v1/country', countryRoutes);
router.use('/v1/auth', authRoutes);

export default router;
