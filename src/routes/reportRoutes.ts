import { Router } from 'express';
import accountTransactionController from '../api/v1/accountTransaction/accountTransaction.controller';
import reportController from '../api/v1/Report/report.controller';
import { authenticate } from '../middleware/authenticate';
import { checkPermissionMiddleware } from '../middleware/check.permission.middleware';

const ReportRoutes: Router = Router()
  .get(
    '/student-ledger',
    authenticate,
    checkPermissionMiddleware('STUDENT_LEDGER', 'can_read'),
    reportController.studentLedger,
  )
  .get(
    '/expense',
    authenticate,
    checkPermissionMiddleware('EXPENSE_HISTORY', 'can_read'),
    reportController.expenseReport,
  )
  .get(
    '/upcoming-installment',
    authenticate,
    checkPermissionMiddleware('UPCOMING_INSTALLMENT', 'can_read'),
    reportController.upcomingInstallments,
  )
  .get(
    '/account-ledger',
    authenticate,
    checkPermissionMiddleware('ACCOUNT_LEDGER', 'can_read'),
    reportController.accountLedger,
  )
  .get(
    '/account-transaction',
    authenticate,
    checkPermissionMiddleware('ACCOUNT_TRANSACTION', 'can_read'),
    accountTransactionController.findAll,
  );

export default ReportRoutes;
