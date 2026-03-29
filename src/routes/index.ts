import { Router } from 'express';

import accountRoutes from './accountRoutes';
import agentRoutes from './agentRoutes';
import auditLogRoutes from './auditLogRoutes';
import authRoutes from './authRoutes';
import balanceTransferRoutes from './balanceTransferRoutes';
import batchRoutes from './batchRoutes';
import countryRoutes from './countryRoutes';
import courseRoutes from './courseRoutes';
import districtRoutes from './districtRoutes';
import divisionRoutes from './divisionRoutes';
import enrollmentRoutes from './enrollmentRoutes';
import expenseHistoryRoutes from './expenseHistoryRoutes';
import headRoutes from './headRoutes';
import moduleRoutes from './moduleRoutes';
import moneyReceiptRoutes from './moneyReceipt';
import packageRoutes from './packageRoutes';
import roleRoutes from './roleRoutes';
import studentRoutes from './studentRoutes';
import upazilaRoutes from './upazilaRoutes';
import userRoutes from './userRoutes';
import ReportRoutes from './reportRoutes';
import agentCommissionRoutes from './agentCommissionRoutes';
import agentPaymentRoutes from './agnetPaymentRoutes';
import { sendMail } from '../utils/sendMail';

const router: Router = Router();
router.use('/v1/config/user', userRoutes);
router.use('/v1/config/country', countryRoutes);
router.use('/v1/config/division', divisionRoutes);
router.use('/v1/config/district', districtRoutes);
router.use('/v1/config/upazila', upazilaRoutes);
router.use('/v1/config/module', moduleRoutes);
router.use('/v1/config/batch', batchRoutes);
router.use('/v1/config/course', courseRoutes);
router.use('/v1/agent', agentRoutes);
router.use('/v1/agent-commission', agentCommissionRoutes);
router.use('/v1/agent-payment', agentPaymentRoutes);
router.use('/v1/config/package', packageRoutes);
router.use('/v1/config/role', roleRoutes);
router.use('/v1', authRoutes);
router.use('/v1/student', studentRoutes);
router.use('/v1/enrollment', enrollmentRoutes);
router.use('/v1/account', accountRoutes);
router.use('/v1/head', headRoutes);
router.use('/v1/expense', expenseHistoryRoutes);
router.use('/v1/balance-transfer', balanceTransferRoutes);
router.use('/v1/money-receipt', moneyReceiptRoutes);
router.use('/v1/report/audit-log', auditLogRoutes);
router.use('/v1/report', ReportRoutes);
router.use('/v1/test', async (req, res) => {
  await sendMail(
    'resalatislam5@gmail.com',
    'Test Email',
    '<p>This is a test email.--> nodemailer</p>',
  );
  res.send('API is working');
});

export default router;
