import { Router } from 'express';

import countryRoutes from './countryRoutes';
import authRoutes from './authRoutes';
import divisionRoutes from './divisionRoutes';
import districtRoutes from './districtRoutes';
import userRoutes from './userRoutes';
import upazilaRoutes from './upazilaRoutes';
import moduleRoutes from './moduleRoutes';

const router: Router = Router();
router.use('/v1/user', userRoutes);
router.use('/v1/country', countryRoutes);
router.use('/v1/division', divisionRoutes);
router.use('/v1/district', districtRoutes);
router.use('/v1/upazila', upazilaRoutes);
router.use('/v1/module', moduleRoutes);
router.use('/v1/auth', authRoutes);

export default router;
