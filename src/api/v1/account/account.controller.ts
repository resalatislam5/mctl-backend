import { NextFunction, Request, Response } from 'express';
import { IParams } from '../../../types/commonTypes';
import { checkMongooseId } from '../../../utils/checkMongooseId';
import { customError } from '../../../utils/customError';
import { detectChanges } from '../../../utils/detectChanges';
import auditLogService from '../auditLog/auditLog.service';
import { IAccountList } from './account.dto';
import accountService from './account.service';
import accountTransactionService from '../accountTransaction/accountTransaction.service';
import { withTransaction } from '../../../utils/withTransaction';
import { convertObjectID } from '../../../utils/ConvertObjectID';
import { Types } from 'mongoose';

const findAll = async (req: Request, res: Response, next: NextFunction) => {
  const search = req.query.search?.toString() || '';
  const limit = Number(req.query.limit || 100);
  const skip = Number(req.query.skip || 0);
  const status = req.query.status?.toString() as 'ACTIVE' | 'INACTIVE';

  try {
    const [data, total] = await Promise.all([
      accountService
        .findAll({ search, status, tenant_id: req.user?.tenant_id })
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 }),
      accountService.count({ search, status, tenant_id: req.user?.tenant_id }),
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

    const data = await accountService.findOne({
      _id: convertObjectID(_id as string),
      tenant_id: req.user?.tenant_id,
    });
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
    charge_percent,
    balance_transfer,
    transfer_acc_type,
    transfer_acc_id,
    status,
  } = req.body as IAccountList;
  try {
    const data = await withTransaction(async (session) => {
      const data = await accountService.create(
        {
          name,
          acc_number,
          account_type,
          bank_name,
          branch_name,
          opening_balance,
          charge_percent,
          balance_transfer,
          transfer_acc_type,
          transfer_acc_id,
          status,
          tenant_id: req.user?.tenant_id,
        },
        session,
      );

      await auditLogService.create(
        {
          req,
          user: req.user,
          action: 'CREATE',
          entity: 'Account',
          entity_id: data?._id,
          description: `A new account has been created account_id: ${data?._id?.toString()}`,
        },
        session,
      );
      await accountTransactionService.create(
        {
          account_id: data._id,
          reference_type: 'Account',
          reference_id: data._id,
          voucher_no: `OP-${Math.floor(Math.random() * 9000 + 1000)}`,
          type: 'CREDIT',
          amount: Number(opening_balance || 0),
          description: 'Opening Balance',
          tenant_id: req.user?.tenant_id,
        },
        session,
      );
      return data;
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
    charge_percent,
    status,
    balance_transfer,
    transfer_acc_type,
    transfer_acc_id,
  } = req.body as IAccountList;

  try {
    checkMongooseId(_id as string);

    const findSingle = await accountService.findOne({
      _id: convertObjectID(_id as string),
      tenant_id: req.user?.tenant_id,
    });
    if (!findSingle) return customError('Account not found', 404);
    const data = await withTransaction(async (session) => {
      const updateData = {
        acc_number,
        account_type,
        bank_name,
        branch_name,
        opening_balance,
        name,
        charge_percent,
        status,
        balance_transfer,
        transfer_acc_type,
        transfer_acc_id,
      };

      let data;
      if (balance_transfer === 'NO') {
        data = await accountService.update({
          _id: convertObjectID(_id as string),
          tenant_id: req.user?.tenant_id,
          data: {
            ...updateData,
            $unset: {
              transfer_acc_id: '',
              transfer_acc_type: '',
              charge_percent: '',
            },
          },
          session,
        });
      } else {
        data = await accountService.update({
          _id: convertObjectID(_id as string),
          tenant_id: req.user?.tenant_id,
          data: {
            ...updateData,
            available_balance: 0,
            opening_balance: 0,
          },
          session,
        });
      }

      const mainTx = await accountTransactionService
        .findOne({
          reference_id: findSingle._id,
          type: 'CREDIT',
          tenant_id: req.user?.tenant_id,
        })
        .session(session);
      if (!mainTx?._id) customError('Account transaction not found', 404);

      await accountTransactionService.update({
        _id: mainTx?._id as Types.ObjectId,
        tenant_id: req.user?.tenant_id,
        data: {
          type: 'CREDIT',
          amount: opening_balance,
          description: 'Opening Balance',
        },
        session,
      });

      const compareChange = detectChanges(
        findSingle.toObject(),
        data?.toObject(),
      );

      await auditLogService.create(
        {
          req,
          user: req.user,
          action: 'UPDATE',
          entity: 'Account',
          entity_id: convertObjectID(_id as string),
          changes: compareChange,
          description: `A new account has been updated account_id: ${_id}`,
        },
        session,
      );

      return data;
    });

    res.json({
      success: true,
      message: 'Account updated successfully',
      data,
    });
  } catch (err) {
    next(err);
  }
};
const deleteItem = async (req: Request, res: Response, next: NextFunction) => {
  const { _id } = req.params;

  try {
    checkMongooseId(_id as string);
    await withTransaction(async (session) => {
      const findSingle = await accountService
        .findOne({
          _id: convertObjectID(_id as string),
          tenant_id: req.user?.tenant_id,
        })
        .session(session);
      if (!findSingle) {
        return customError('Account not found', 404);
      }
      const mainTx = await accountTransactionService
        .findOne({
          reference_id: findSingle._id,
          type: 'CREDIT',
          tenant_id: req.user?.tenant_id,
        })
        .session(session);

      await accountTransactionService
        .deleteItem({
          _id: mainTx?._id as Types.ObjectId,
          tenant_id: req.user?.tenant_id,
        })
        .session(session);

      await accountService
        .deleteItem({
          _id: convertObjectID(_id as string),
          tenant_id: req.user?.tenant_id,
        })
        .session(session);

      await auditLogService.create({
        req,
        user: req.user,
        action: 'DELETE',
        entity: 'Account',
        entity_id: convertObjectID(_id as string),
        changes: findSingle,
        description: `A new account has been deleted account_id: ${_id}`,
      });
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
  let new_account_type = '';
  let account_type = req.query.account_type?.toString() || '';
  const payment_method = req.query.payment_method?.toString() || '';
  const balance_transfer = (req.query.balance_transfer?.toString() ||
    undefined) as 'YES' | 'NO';
  if (account_type) {
    new_account_type = account_type;
  } else if (payment_method) {
    new_account_type = payment_method;
  }

  try {
    const data = await accountService
      .findAll({
        status: 'ACTIVE',
        account_type: new_account_type,
        tenant_id: req.user?.tenant_id,
        balance_transfer,
      })
      .select('name code _id');
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export default { findAll, create, findSingle, update, deleteItem, select };
