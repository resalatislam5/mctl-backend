import { Router } from 'express';
import reportController from '../api/v1/Report/report.controller';
import { authenticate } from '../middleware/authenticate';

const ReportRoutes: Router = Router()
  .get('/student-ledger', authenticate, reportController.studentLedger)
  .get('/expense', authenticate, reportController.expenseReport);

export default ReportRoutes;
