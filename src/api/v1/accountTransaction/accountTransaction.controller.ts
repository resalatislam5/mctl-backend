import { NextFunction, Request, Response } from 'express';

import { checkMongooseId } from '../../../utils/checkMongooseId';
import { customError } from '../../../utils/customError';
import accountTransactionService from './accountTransaction.service';

const findAll = async (req: Request, res: Response, next: NextFunction) => {
  const account_id = req.query.account_id?.toString() || '';
  const from_date = req.query.from_date?.toString() || '';
  const to_date = req.query.to_date?.toString() || '';

  try {
    const [data, total] = await Promise.all([
      accountTransactionService
        .findAll({ account_id, from_date, to_date })
        .sort({ createdAt: -1 }),
      accountTransactionService.count({ account_id, from_date, to_date }),
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
      key: { _id: _id as string },
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
