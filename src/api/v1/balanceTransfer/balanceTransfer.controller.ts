import { NextFunction, Request, Response } from 'express';
import { IParams } from '../../../types/commonTypes';
import { checkMongooseId } from '../../../utils/checkMongooseId';
import { customError } from '../../../utils/customError';
import { detectChanges } from '../../../utils/detectChanges';
import auditLogService from '../auditLog/auditLog.service';
import balanceTransferService from './balanceTransfer.service';
import { BalanceTransfer } from './balanceTransfer.model';
import { IBalanceTransferList } from './balanceTransfer.dto';
import { withTransaction } from '../../../utils/withTransaction';
import accountService from '../account/account.service';
import { generateCode } from '../counter/generateCode';
import { convertObjectID } from '../../../utils/ConvertObjectID';
import accountTransactionService from '../accountTransaction/accountTransaction.service';

const findAll = async (req: Request, res: Response, next: NextFunction) => {
  const query: any = { tenant_id: req.user?.tenant_id };
  const search = req.query.search?.toString() || '';
  const limit = Number(req.query.limit || 100);
  const skip = Number(req.query.skip || 0);

  if (search) {
    query.$or = [{ name: { $regex: search, $options: 'i' } }];
  }

  try {
    const data = await BalanceTransfer.aggregate([
      {
        $match: query,
      },
      {
        $lookup: {
          from: 'accounts',
          localField: 'from_acc_id',
          foreignField: '_id',
          as: 'form_account',
        },
      },
      {
        $lookup: {
          from: 'accounts',
          localField: 'to_acc_id',
          foreignField: '_id',
          as: 'to_account',
        },
      },
      {
        $addFields: {
          from_acc_name: {
            $ifNull: [{ $arrayElemAt: ['$form_account.name', 0] }, null],
          },
          to_acc_name: {
            $ifNull: [{ $arrayElemAt: ['$to_account.name', 0] }, null],
          },
        },
      },

      {
        $sort: { createdAt: -1 },
      },
      {
        $facet: {
          data: [
            {
              $skip: skip,
            },
            {
              $limit: limit,
            },
            {
              $project: {
                form_account: 0,
                to_account: 0,
              },
            },
          ],
          totalCount: [{ $count: 'count' }],
        },
      },
    ]);
    res.json({
      success: true,
      total: data[0]?.totalCount?.count,
      data: data[0]?.data,
    });
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

    const data = await BalanceTransfer.aggregate([
      {
        $match: { _id: convertObjectID(_id), tenant_id: req.user?.tenant_id },
      },
      {
        $lookup: {
          from: 'accounts',
          localField: 'from_acc_id',
          foreignField: '_id',
          as: 'form_account',
        },
      },
      {
        $lookup: {
          from: 'accounts',
          localField: 'to_acc_id',
          foreignField: '_id',
          as: 'to_account',
        },
      },
      {
        $addFields: {
          from_acc_name: {
            $ifNull: [{ $arrayElemAt: ['$form_account.name', 0] }, null],
          },
          to_acc_name: {
            $ifNull: [{ $arrayElemAt: ['$to_account.name', 0] }, null],
          },
        },
      },
    ]);

    if (!data[0]) {
      customError('Balance transfer not found', 404);
    }
    res.json({ success: true, data: data[0] });
  } catch (err) {
    next(err);
  }
};

const create = async (req: Request, res: Response, next: NextFunction) => {
  const { amount, date, from_acc_id, note, to_acc_id } =
    req.body as IBalanceTransferList;

  try {
    const data = await withTransaction(async (session) => {
      const from_acc = await accountService.findOne({
        _id: from_acc_id,
        tenant_id: req.user?.tenant_id,
      });
      const to_acc = await accountService.findOne({
        _id: to_acc_id,
        tenant_id: req.user?.tenant_id,
      });

      if (!from_acc) customError('From Account Not Found', 404);
      if (!to_acc) customError('To Account Not Found', 404);

      const voucher_no = await generateCode(
        'balance_transfer',
        'BT',
        session,
        req.user?.tenant_id,
      );
      const data = await balanceTransferService.create(
        {
          amount,
          date,
          from_acc_id,
          note,
          to_acc_id,
          voucher_no,
          tenant_id: req.user?.tenant_id,
        },
        session,
      );
      await accountTransactionService.create(
        {
          type: 'DEBIT',
          amount,
          account_id: from_acc_id,
          voucher_no,
          reference_type: 'BalanceTransfer',
          tenant_id: req.user?.tenant_id,
          is_balance_transfer: true,
          reference_id: data?._id,
          description: `Balance transfer from ${from_acc?.name} to ${to_acc?.name}`,
        },
        session,
      );
      await accountTransactionService.create(
        {
          type: 'CREDIT',
          amount,
          account_id: to_acc_id,
          voucher_no,
          tenant_id: req.user?.tenant_id,
          reference_type: 'BalanceTransfer',
          is_balance_transfer: true,
          reference_id: data?._id,
          description: `Balance transfer from ${from_acc?.name} to ${to_acc?.name}`,
        },
        session,
      );

      await auditLogService.create({
        req,
        user: req.user,
        action: 'CREATE',
        entity: 'balance_transfer',
        entity_id: data?._id,
        description: `A new balance transfer has been created balance_transfer_id: ${data?._id?.toString()}`,
      });
      return data;
    });

    res.json({
      success: true,
      message: 'Balance transfer created successfully',
      data,
    });
  } catch (err) {
    next(err);
  }
};

const update = async (req: Request, res: Response, next: NextFunction) => {
  const { _id } = req.params;

  const { amount, date, from_acc_id, note, to_acc_id } = (req?.body ||
    {}) as IBalanceTransferList;

  try {
    checkMongooseId(_id as string);

    const findSingle = await balanceTransferService.findOne({
      _id: convertObjectID(_id as string),
      tenant_id: req.user?.tenant_id,
    });

    if (!findSingle) {
      return customError('Balance transfer not found', 404);
    }

    const from_acc_transaction = await accountTransactionService.findOne({
      reference_id: convertObjectID(_id as string),
      tenant_id: req.user?.tenant_id,
      type: 'DEBIT',
    });

    const to_acc_transaction = await accountTransactionService.findOne({
      reference_id: convertObjectID(_id as string),
      tenant_id: req.user?.tenant_id,
      type: 'CREDIT',
    });

    if (!from_acc_transaction)
      customError('From Account Transaction Not Found', 404);
    if (!to_acc_transaction)
      customError('To Account Transaction Not Found', 404);

    const data = await withTransaction(async (session) => {
      const from_acc = await accountService.findOne({
        _id: from_acc_id,
        tenant_id: req.user?.tenant_id,
      });

      if (!from_acc) customError('From Account Not Found', 404);
      const to_acc = await accountService.findOne({
        _id: to_acc_id,
        tenant_id: req.user?.tenant_id,
      });
      if (!to_acc) customError('To Account Not Found', 404);

      const data = await balanceTransferService.update({
        _id: convertObjectID(_id as string),
        tenant_id: req.user?.tenant_id,
        data: {
          amount,
          date,
          from_acc_id,
          note,
          to_acc_id,
        },
        session,
      });

      const compareChange = detectChanges(
        findSingle.toObject(),
        data?.toObject(),
      );

      await accountTransactionService.update({
        _id: convertObjectID(from_acc_transaction?._id),
        tenant_id: req.user?.tenant_id,
        data: {
          type: 'DEBIT',
          amount,
          account_id: from_acc_id,
          description: `Balance transfer from ${from_acc?.name} to ${to_acc?.name}`,
        },
        session,
      });

      await accountTransactionService.update({
        _id: convertObjectID(to_acc_transaction?._id),
        tenant_id: req.user?.tenant_id,

        data: {
          type: 'CREDIT',
          amount,
          account_id: to_acc_id,
          description: `Balance transfer from ${from_acc?.name} to ${to_acc?.name}`,
        },
        session,
      });

      await auditLogService.create({
        req,
        user: req.user,
        action: 'UPDATE',
        entity: 'balance_transfer',
        entity_id: findSingle._id,
        changes: compareChange,
        description: `A new balance transfer has been updated balance_transfer_id: ${_id}`,
      });

      return data;
    });

    res.json({
      success: true,
      message: 'Balance transfer updated successfully',
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
    await withTransaction(async (session) => {
      const from_acc_transaction = await accountTransactionService
        .findOne({
          reference_id: convertObjectID(_id as string),
          tenant_id: req.user?.tenant_id,
          type: 'DEBIT',
        })
        .session(session);
      const to_acc_transaction = await accountTransactionService
        .findOne({
          reference_id: convertObjectID(_id as string),
          tenant_id: req.user?.tenant_id,
          type: 'CREDIT',
        })
        .session(session);

      if (!from_acc_transaction)
        customError('From Account Transaction Not Found', 404);
      if (!to_acc_transaction)
        customError('To Account Transaction Not Found', 404);

      const findSingle = await balanceTransferService
        .findOne({
          _id: convertObjectID(_id as string),
          tenant_id: req.user?.tenant_id,
        })
        .session(session);

      if (!findSingle) {
        return customError('Balance transfer not found', 404);
      }
      await accountTransactionService
        .deleteItem({
          _id: convertObjectID(from_acc_transaction?._id),
          tenant_id: req.user?.tenant_id,
        })
        .session(session);
      await accountTransactionService
        .deleteItem({
          _id: convertObjectID(to_acc_transaction?._id),
          tenant_id: req.user?.tenant_id,
        })
        .session(session);

      await balanceTransferService
        .deleteItem({
          _id: convertObjectID(_id as string),
          tenant_id: req.user?.tenant_id,
        })
        .session(session);

      await auditLogService.create(
        {
          req,
          user: req.user,
          action: 'DELETE',
          entity: 'balance_transfer',
          entity_id: findSingle._id,
          changes: findSingle,
          description: `A new balance transfer has been deleted balance_transfer_id: ${_id}`,
        },
        session,
      );
    });

    res.json({
      success: true,
      message: 'Balance transfer deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

export default { findAll, create, update, deleteItem, findSingle };
