import { Router } from 'express';

import countryRoutes from './countryRoutes';
import authRoutes from './authRoutes';
import divisionRoutes from './divisionRoutes';
import districtRoutes from './districtRoutes';
import userRoutes from './userRoutes';
import upazilaRoutes from './upazilaRoutes';
import moduleRoutes from './moduleRoutes';
import batchRoutes from './batchRoutes';
import courseRoutes from './courseRoutes';
import agentRoutes from './agentRoutes';

const router: Router = Router();
router.use('/v1/config/user', userRoutes);
router.use('/v1/config/country', countryRoutes);
router.use('/v1/config/division', divisionRoutes);
router.use('/v1/config/district', districtRoutes);
router.use('/v1/config/upazila', upazilaRoutes);
router.use('/v1/config/module', moduleRoutes);
router.use('/v1/config/batch', batchRoutes);
router.use('/v1/config/course', courseRoutes);
router.use('/v1/config/agent', agentRoutes);
router.use('/v1/auth', authRoutes);

export default router;
