import { NextFunction, Request, Response } from 'express';

import { checkMongooseId } from '../../../utils/checkMongooseId';
import { customError } from '../../../utils/customError';
import accountTransactionService from './accountTransaction.service';
import { convertObjectID } from '../../../utils/ConvertObjectID';

const findAll = async (req: Request, res: Response, next: NextFunction) => {
  const query: any = { tenant_id: req.user?.tenant_id };
  const account_id = req.query.account_id?.toString() || '';
  const from_date = req.query.from_date?.toString() || '';
  const to_date = req.query.to_date?.toString() || '';
  const is_balance_transfer = req.query.is_balance_transfer?.toString() || '';

  if (account_id) {
    query.account_id = convertObjectID(account_id);
  }

  if (from_date) {
    query.from_date = from_date;
  }
  if (to_date) {
    query.to_date = to_date;
  }

  if (is_balance_transfer === 'true') {
    query.is_balance_transfer = 'true';
  }
  if (is_balance_transfer === 'false') {
    query.is_balance_transfer = 'false';
  }

  try {
    const [data, total] = await Promise.all([
      accountTransactionService.findAll(query).sort({ createdAt: -1 }),
      accountTransactionService.count(query),
    ]);
    res.json({ success: true, total, data });
  } catch (err) {
    next(err);
  }
};

const findSingle = async (req: Request, res: Response, next: NextFunction) => {
  const { _id } = req.params;
  try {
    checkMongooseId(_id as string);

    const data = await accountTransactionService.findOne({
      _id: convertObjectID(_id as string),
      tenant_id: req.user?.tenant_id,
    });
    if (!data) {
      customError('Account Transaction not found', 404);
    }
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export default { findAll, findSingle };
