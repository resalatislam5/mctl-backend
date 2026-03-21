import { NextFunction, Request, Response } from 'express';

import accountTransactionService from './accountTransaction.service';
import { IParams } from '../../../types/commonTypes';
import { checkMongooseId } from '../../../utils/checkMongooseId';
import { customError } from '../../../utils/customError';

const findAll = async (req: Request, res: Response, next: NextFunction) => {
  const account_id = req.query.account_id?.toString() || '';

  try {
    const [data, total] = await Promise.all([
      accountTransactionService.findAll({ account_id }).sort({ createdAt: -1 }),
      accountTransactionService.count({ account_id }),
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
