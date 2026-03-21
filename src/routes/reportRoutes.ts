import { Router } from 'express';
import accountTransactionController from '../api/v1/accountTransaction/accountTransaction.controller';
import reportController from '../api/v1/Report/report.controller';
import { authenticate } from '../middleware/authenticate';

const ReportRoutes: Router = Router()
  .get('/student-ledger', authenticate, reportController.studentLedger)
  .get('/expense', authenticate, reportController.expenseReport)
  .get(
    '/upcoming-installment',
    authenticate,
    reportController.upcomingInstallments,
  )
  .get('/account-ledger', authenticate, accountTransactionController.findAll);

export default ReportRoutes;
