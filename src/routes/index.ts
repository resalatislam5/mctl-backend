import { Router } from 'express';

import agentRoutes from './agentRoutes';
import auditLogRoutes from './auditLogRoutes';
import authRoutes from './authRoutes';
import batchRoutes from './batchRoutes';
import countryRoutes from './countryRoutes';
import courseRoutes from './courseRoutes';
import districtRoutes from './districtRoutes';
import divisionRoutes from './divisionRoutes';
import moduleRoutes from './moduleRoutes';
import packageRoutes from './packageRoutes';
import roleRoutes from './roleRoutes';
import upazilaRoutes from './upazilaRoutes';
import userRoutes from './userRoutes';
import studentRoutes from './studentRoutes';

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
router.use('/v1/config/package', packageRoutes);
router.use('/v1/config/role', roleRoutes);
router.use('/v1', authRoutes);
router.use('/v1/student', studentRoutes);
router.use('/v1/report/audit-log', auditLogRoutes);

export default router;
