import { NextFunction, Request, Response } from 'express';
import auditLogService from './auditLog.service';

const findAll = async (req: Request, res: Response, next: NextFunction) => {
  const from_date = req.query.from_date as string;
  const to_date = req.query.to_date as string;
  const user_id = req.query.user_id as string;

  try {
    const [data, total] = await Promise.all([
      auditLogService
        .findAll({ from_date, to_date, user_id, tenant_id: req.user.tenant_id })
        .sort({ createdAt: -1 }),
      auditLogService.count({
        from_date,
        to_date,
        user_id,
        tenant_id: req.user.tenant_id,
      }),
    ]);
    res.json({ success: true, total, data });
  } catch (err) {
    next(err);
  }
};

export default { findAll };
