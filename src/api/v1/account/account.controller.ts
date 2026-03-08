import { NextFunction, Request, Response } from 'express';
import { IParams } from '../../../types/commonTypes';
import { checkMongooseId } from '../../../utils/checkMongooseId';
import { customError } from '../../../utils/customError';
import { detectChanges } from '../../../utils/detectChanges';
import auditLogService from '../auditLog/auditLog.service';
import accountService from './account.service';
import { IAccountFindAllParams, IAccountList } from './account.dto';

const findAll = async (req: Request, res: Response, next: NextFunction) => {
  const search = req.query.search?.toString() || '';
  const limit = Number(req.query.limit || 100);
  const skip = Number(req.query.skip || 0);
  const status = req.query.status?.toString() as 'ACTIVE' | 'INACTIVE';

  try {
    const [data, total] = await Promise.all([
      accountService
        .findAll({ search, status })
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 }),
      accountService.count({ search, status }),
    ]);
    res.json({ success: true, total, data });
  } catch (err) {
    next(err);
  }
};

const findSingle = async (
  req: Request<IParams>,
  res: Response,
  next: NextFunction,
) => {
  const { _id } = req.params;
  try {
    checkMongooseId(_id);

    const data = await accountService.findOne({ key: { _id: _id as string } });
    if (!data) {
      customError('Account not found', 404);
    }
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const create = async (req: Request, res: Response, next: NextFunction) => {
  const {
    name,
    acc_number,
    account_type,
    bank_name,
    branch_name,
    opening_balance,
    status,
  } = req.body as IAccountList;
  try {
    const data = await accountService.create({
      name,
      acc_number,
      account_type,
      bank_name,
      branch_name,
      opening_balance,
      available_balance: opening_balance,
      status,
    });

    await auditLogService.create({
      req,
      user: req.user,
      action: 'CREATE',
      entity: 'Account',
      entity_id: data?._id?.toString() as string,
      description: `A new account has been created account_id: ${data?._id?.toString()}`,
    });

    res.json({
      success: true,
      message: 'Account created successfully',
      data,
    });
  } catch (err) {
    next(err);
  }
};

const update = async (req: Request, res: Response, next: NextFunction) => {
  const { _id } = req.params;
  const {
    acc_number,
    account_type,
    bank_name,
    branch_name,
    opening_balance,
    name,
    status,
  } = req.body as IAccountList;

  try {
    checkMongooseId(_id as string);

    const findSingle = await accountService.findOne({
      key: { _id: _id as string },
    });
    if (!findSingle) {
      return customError('Account not found', 404);
    }
    let available_balance = opening_balance;
    if (
      Number(opening_balance || 0) > Number(findSingle.opening_balance || 0)
    ) {
      let new_available_balance =
        Number(opening_balance) - Number(findSingle.opening_balance);

      available_balance = (
        Number(findSingle.opening_balance) + new_available_balance
      ).toFixed(2);
    }
    if (
      Number(opening_balance || 0) < Number(findSingle.opening_balance || 0)
    ) {
      let new_available_balance =
        Number(findSingle.opening_balance) - Number(opening_balance);

      available_balance = (
        Number(findSingle.opening_balance) - new_available_balance
      ).toFixed(2);
    }

    const data = await accountService.update(_id as string, {
      acc_number,
      account_type,
      bank_name,
      branch_name,
      opening_balance,
      available_balance,
      name,
      status,
    });

    const compareChange = detectChanges(
      findSingle.toObject(),
      data?.toObject(),
    );

    await auditLogService.create({
      req,
      user: req.user,
      action: 'UPDATE',
      entity: 'Account',
      entity_id: _id as string,
      changes: compareChange,
      description: `A new account has been updated account_id: ${_id}`,
    });

    res.json({
      success: true,
      message: 'Account updated successfully',
      data: data,
    });
  } catch (err) {
    next(err);
  }
};

const deleteItem = async (req: Request, res: Response, next: NextFunction) => {
  const { _id } = req.params;

  try {
    checkMongooseId(_id as string);

    const findSingle = await accountService.findOne({
      key: { _id: _id as string },
    });
    if (!findSingle) {
      return customError('Account not found', 404);
    }

    await accountService.deleteItem(_id as string);

    await auditLogService.create({
      req,
      user: req.user,
      action: 'DELETE',
      entity: 'Account',
      entity_id: _id as string,
      changes: findSingle,
      description: `A new account has been deleted account_id: ${_id}`,
    });
    res.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

const select = async (req: Request, res: Response, next: NextFunction) => {
  const account_type = req.query.account_type?.toString() || '';

  try {
    const data = await accountService
      .findAll({
        status: 'ACTIVE',
        account_type: account_type,
      })
      .select('name code _id');
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export default { findAll, create, findSingle, update, deleteItem, select };
