import { NextFunction, Request, Response } from 'express';

export type permissionTags =
  | 'DASHBOARD'
  | 'COUNTRY'
  | 'USER'
  | 'ROLE'
  | 'STUDENT'
  | 'DIVISION'
  | 'DISTRICT'
  | 'UPAZILA'
  | 'BATCH'
  | 'COURSE'
  | 'AGENT'
  | 'AUDIT'
  | 'PACKAGE'
  | 'ENROLLMENT'
  | 'MONEY_RECEIPT'
  | 'HEAD'
  | 'ACCOUNT'
  | 'EXPENSE_HISTORY'
  | 'STUDENT_LEDGER'
  | 'EXPENSE_REPORT'
  | 'UPCOMING_INSTALLMENT'
  | 'AGENT_COMMISSION'
  | 'ACCOUNT_LEDGER'
  | 'AGENT_PAYMENT'
  | 'BALANCE_TRANSFER';

export const checkPermissionMiddleware = (
  name: permissionTags,
  permission: 'can_read' | 'can_create' | 'can_update' | 'can_delete',
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    console.log(user);

    const perm = user.permissions.find((p: any) => p.name === name);
    if (!perm) {
      return res.status(403).json({
        success: false,
        message: 'You have no permission to access this resource',
      });
    }

    if (!perm[permission]) {
      return res.status(403).json({
        success: false,
        message: 'You have no permission to perform this action',
      });
    }
    next();
  };
};
