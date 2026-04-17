import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';
import { IParams } from '../../../types/commonTypes';
import { checkMongooseId } from '../../../utils/checkMongooseId';
import { convertObjectID } from '../../../utils/ConvertObjectID';
import { customError } from '../../../utils/customError';
import { detectChanges } from '../../../utils/detectChanges';
import { withTransaction } from '../../../utils/withTransaction';
import accountService from '../account/account.service';
import accountTransactionService from '../accountTransaction/accountTransaction.service';
import auditLogService from '../auditLog/auditLog.service';
import { generateCode } from '../counter/generateCode';
import { IExpenseHistoryList } from './expenseHistory.dto';
import expenseHistoryService from './expenseHistory.service';

const findAll = async (req: Request, res: Response, next: NextFunction) => {
  const query: any = {};
  const search = req.query.search?.toString() || '';
  const limit = Number(req.query.limit || 100);
  const skip = Number(req.query.skip || 0);
  if (search) {
    query.$or = [{ voucher_no: { $regex: search, $options: 'i' } }];
  }

  try {
    const data = await expenseHistoryService.aggregate([
      {
        $match: { tenant_id: req.user?.tenant_id },
      },
      {
        $lookup: {
          from: 'accounts',
          localField: 'acc_id',
          foreignField: '_id',
          as: 'account',
        },
      },
      {
        $addFields: {
          account_name: {
            $ifNull: [{ $arrayElemAt: ['$account.name', 0] }, null],
          },
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
      {
        $sort: { createdAt: -1 },
      },

      {
        $facet: {
          data: [
            {
              $project: {
                _id: 1,
                date: 1,
                voucher_no: 1,
                account_name: 1,
                account_type: 1,
                total_amount: 1,
              },
            },
          ],
          totalCount: [{ $count: 'count' }],
        },
      },
    ]);
    res.json({
      success: true,
      total: data[0]?.totalCount[0]?.count,
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

    const data = await expenseHistoryService.aggregate([
      {
        $match: { _id: convertObjectID(_id), tenant_id: req.user?.tenant_id },
      },
      {
        $lookup: {
          from: 'heads',
          localField: 'expense_details.head_id',
          foreignField: '_id',
          as: 'head',
        },
      },
      {
        $lookup: {
          from: 'accounts',
          localField: 'acc_id',
          foreignField: '_id',
          as: 'account',
        },
      },
      {
        $addFields: {
          'expense_details.head_name': {
            $ifNull: [{ $arrayElemAt: ['$head.name', 0] }, null],
          },
          acc_name: {
            $ifNull: [{ $arrayElemAt: ['$account.name', 0] }, null],
          },
        },
      },
      {
        $project: {
          head: 0,
          account: 0,
        },
      },
    ]);
    if (!data?.[0]) {
      customError('Expense not found', 404);
    }
    res.json({ success: true, data: data?.[0] });
  } catch (err) {
    next(err);
  }
};

const create = async (req: Request, res: Response, next: NextFunction) => {
  const { acc_id, account_type, date, expense_details, note, total_amount } =
    req.body as IExpenseHistoryList;

  try {
    const data = await withTransaction(async (session) => {
      const voucher_no = await generateCode(
        'expense_history',
        'EXP',
        session,
        req.user?.tenant_id,
      );
      const account = await accountService
        .findOne({ _id: acc_id, tenant_id: req.user?.tenant_id })
        .session(session);
      if (!account) {
        customError('Account not found', 404);
      }

      const data = await expenseHistoryService.create({
        acc_id,
        account_type,
        date,
        expense_details,
        note,
        total_amount,
        voucher_no,
        tenant_id: req.user?.tenant_id,
      });

      await accountTransactionService.create(
        {
          account_id: convertObjectID(acc_id),
          reference_type: 'ExpenseHistory',
          reference_id: data?._id,
          voucher_no: data?.voucher_no,
          amount: total_amount,
          type: 'DEBIT',
          description: `Paid ${total_amount} for multiple expenses via ${account_type}`,
          tenant_id: req.user?.tenant_id,
        },
        session,
      );

      return data;
    });

    await auditLogService.create({
      req,
      user: req.user,
      action: 'CREATE',
      entity: 'Expense',
      entity_id: data?._id,
      description: `A new Expense has been created expense_id: ${data?._id?.toString()}`,
    });

    res.json({
      success: true,
      message: 'Expense created successfully',
      data,
    });
  } catch (err) {
    next(err);
  }
};

const update = async (req: Request, res: Response, next: NextFunction) => {
  const { _id } = req.params;

  const { acc_id, account_type, date, expense_details, note, total_amount } =
    (req?.body || {}) as IExpenseHistoryList;

  try {
    checkMongooseId(_id as string);
    const findSingle = await expenseHistoryService.findOne({
      _id: convertObjectID(_id as string),
      tenant_id: req.user?.tenant_id,
    });

    if (!findSingle) {
      return customError('Expense not found', 404);
    }

    const data = await withTransaction(async (session) => {
      const account = await accountService
        .findOne({ _id: acc_id, tenant_id: req.user?.tenant_id })
        .session(session);
      if (!account) {
        customError('Account not found', 404);
      }

      const data = await expenseHistoryService.update({
        _id: convertObjectID(_id as string),
        tenant_id: req.user?.tenant_id,
        data: {
          acc_id,
          account_type,
          date,
          expense_details,
          note,
          total_amount,
        },
        session,
      });

      const accountTransaction = await accountTransactionService
        .findOne({
          reference_id: findSingle._id,
          tenant_id: req.user?.tenant_id,
        })
        .session(session);

      if (!accountTransaction)
        customError('Account Transaction Not Found', 404);

      await accountTransactionService.update({
        _id: accountTransaction?._id as Types.ObjectId,
        tenant_id: req.user?.tenant_id,
        data: {
          account_id: acc_id,
          money_receipt_id: findSingle?._id.toString(),
          amount: total_amount,
          type: 'DEBIT',
          description: `Paid ${total_amount} for multiple expenses via ${account_type}`,
        },
        session,
      });

      const compareChange = detectChanges(
        findSingle.toObject(),
        data?.toObject(),
      );

      await auditLogService.create({
        req,
        user: req.user,
        action: 'UPDATE',
        entity: 'Expense',
        entity_id: findSingle._id,
        changes: compareChange,
        description: `A new Expense has been deleted expense_id: ${_id}`,
      });
      session;
    });

    res.json({
      success: true,
      message: 'Expense updated successfully',
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

    const findSingle = await expenseHistoryService.findOne({
      _id: convertObjectID(_id as string),
      tenant_id: req.user?.tenant_id,
    });
    if (!findSingle) {
      return customError('Expense not found', 404);
    }
    await withTransaction(async (session) => {
      const accountTransaction = await accountTransactionService.findOne({
        reference_id: findSingle._id,
        tenant_id: req.user?.tenant_id,
      });

      if (!accountTransaction) {
        customError('Transaction not found', 404);
      }
      await accountTransactionService
        .deleteItem({
          _id: accountTransaction?._id as Types.ObjectId,
          tenant_id: req.user?.tenant_id,
        })
        .session(session);

      await expenseHistoryService
        .deleteItem({
          _id: convertObjectID(_id as string),
          tenant_id: req.user?.tenant_id,
        })
        .session(session);
      await auditLogService.create({
        req,
        user: req.user,
        action: 'DELETE',
        entity: 'Expense',
        entity_id: findSingle._id,
        changes: findSingle,
        description: `A new Expense has been deleted expense_id: ${_id}`,
      });
      session;
    });

    res.json({
      success: true,
      message: 'Expense deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

const select = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await expenseHistoryService
      .findAll({ tenant_id: req.user?.tenant_id })
      .select('name _id');
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export default { findAll, create, findSingle, update, deleteItem, select };
