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
          available_balance: opening_balance,
          charge_percent,
          balance_transfer,
          transfer_acc_type,
          transfer_acc_id,
          status,
        },
        session,
      );

      await auditLogService.create(
        {
          req,
          user: req.user,
          action: 'CREATE',
          entity: 'Account',
          entity_id: data?._id?.toString() as string,
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
          amount: opening_balance || '0',
          description: 'Opening Balance',
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
      key: { _id: _id as string },
    });
    if (!findSingle) return customError('Account not found', 404);
    const data = await withTransaction(async (session) => {
      // 🔹 Optimized available_balance calculation
      const balanceDiff =
        Number(opening_balance || 0) - Number(findSingle.opening_balance || 0);

      const available_balance = (
        Number(findSingle.available_balance || 0) + balanceDiff
      ).toFixed(2);

      const updateData = {
        acc_number,
        account_type,
        bank_name,
        branch_name,
        opening_balance,
        available_balance,
        name,
        charge_percent,
        status,
        balance_transfer,
        transfer_acc_type,
        transfer_acc_id,
      };

      let data;
      if (balance_transfer === 'NO') {
        data = await accountService.update(
          _id as string,
          {
            ...updateData,
            $unset: {
              transfer_acc_id: '',
              transfer_acc_type: '',
              charge_percent: '',
            },
          },
          session,
        );
      } else {
        data = await accountService.update(
          _id as string,
          {
            ...updateData,
            available_balance: '0',
            opening_balance: '0',
          },
          session,
        );
      }

      const mainTx = await accountTransactionService
        .findOne({
          key: { reference_id: findSingle._id, type: 'CREDIT' },
        })
        .session(session);
      if (!mainTx?._id) customError('Account transaction not found', 404);

      await accountTransactionService.update(
        `${mainTx?._id}`,
        {
          type: 'CREDIT',
          amount: opening_balance,
          description: 'Opening Balance',
        },
        session,
      );
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
          entity_id: _id as string,
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
          key: { _id: _id as string },
        })
        .session(session);
      if (!findSingle) {
        return customError('Account not found', 404);
      }
      const mainTx = await accountTransactionService
        .findOne({
          key: { reference_id: findSingle._id, type: 'CREDIT' },
        })
        .session(session);

      await accountTransactionService
        .deleteItem(`${mainTx?._id}`)
        .session(session);

      await accountService.deleteItem(_id as string).session(session);

      await auditLogService.create({
        req,
        user: req.user,
        action: 'DELETE',
        entity: 'Account',
        entity_id: _id as string,
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
      })
      .select('name code _id');
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export default { findAll, create, findSingle, update, deleteItem, select };
