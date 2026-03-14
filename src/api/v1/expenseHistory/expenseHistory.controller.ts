import { NextFunction, Request, Response } from 'express';
import { IParams } from '../../../types/commonTypes';
import { checkMongooseId } from '../../../utils/checkMongooseId';
import { customError } from '../../../utils/customError';
import { detectChanges } from '../../../utils/detectChanges';
import auditLogService from '../auditLog/auditLog.service';
import { generateCode } from '../counter/generateCode';
import { IExpenseHistoryList } from './expenseHistory.dto';
import expenseHistoryService from './expenseHistory.service';
import { convertObjectID } from '../../../utils/ConvertObjectID';
import { withTransaction } from '../../../utils/withTransaction';
import accountService from '../account/account.service';

const findAll = async (req: Request, res: Response, next: NextFunction) => {
  const search = req.query.search?.toString() || '';
  const limit = Number(req.query.limit || 100);
  const skip = Number(req.query.skip || 0);
  try {
    //   expenseHistoryService.count({ search }),
    // ]);
    const data = await expenseHistoryService.aggregate([
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
        $match: { _id: convertObjectID(_id) },
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
      const voucher_no = await generateCode('expense_history', 'EXP', session);
      const account = await accountService.findOne({ key: { _id: acc_id } });
      if (!account) {
        customError('Account not found', 404);
      }
      await accountService.update(
        acc_id,
        {
          available_balance:
            Number(account?.available_balance || 0) - Number(total_amount || 0),
        },
        session,
      );

      const data = await expenseHistoryService.create({
        acc_id,
        account_type,
        date,
        expense_details,
        note,
        total_amount,
        voucher_no,
      });
      return data;
    });

    await auditLogService.create({
      req,
      user: req.user,
      action: 'CREATE',
      entity: 'Expense',
      entity_id: data?._id?.toString() as string,
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
      key: { _id: _id as string },
    });
    if (!findSingle) {
      return customError('Expense not found', 404);
    }

    const data = await withTransaction(async (session) => {
      const account = await accountService
        .findOne({ key: { _id: acc_id } })
        .session(session);
      if (!account) {
        customError('Account not found', 404);
      }

      const net_total_amount =
        Number(findSingle.total_amount || 0) - Number(total_amount || 0);
      console.log('net_total_amount', net_total_amount);

      await accountService.update(
        acc_id,
        {
          available_balance: (
            Number(account?.available_balance || 0) + net_total_amount
          ).toFixed(2),
        },
        session,
      );

      const data = await expenseHistoryService.update(
        _id as string,
        {
          acc_id,
          account_type,
          date,
          expense_details,
          note,
          total_amount,
        },
        session,
      );

      const compareChange = detectChanges(
        findSingle.toObject(),
        data?.toObject(),
      );

      await auditLogService.create({
        req,
        user: req.user,
        action: 'UPDATE',
        entity: 'Expense',
        entity_id: _id as string,
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
      key: { _id: _id as string },
    });
    if (!findSingle) {
      return customError('Expense not found', 404);
    }
    await withTransaction(async (session) => {
      const account = await accountService
        .findOne({ key: { _id: `${findSingle?.acc_id}` } })
        .session(session);

      await accountService.update(
        `${findSingle.acc_id}`,
        {
          available_balance: (
            Number(account?.available_balance || 0) -
            Number(findSingle.total_amount || 0)
          ).toFixed(2),
        },
        session,
      );

      await expenseHistoryService.deleteItem(_id as string).session(session);
      await auditLogService.create({
        req,
        user: req.user,
        action: 'DELETE',
        entity: 'Expense',
        entity_id: _id as string,
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
    const data = await expenseHistoryService.findAll({}).select('name _id');
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export default { findAll, create, findSingle, update, deleteItem, select };
