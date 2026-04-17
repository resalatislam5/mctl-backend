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
import agentCommissionService from '../agentCommission/agentCommission.service';
import auditLogService from '../auditLog/auditLog.service';
import { generateCode } from '../counter/generateCode';
import { IAgentPaymentList } from './agentPayment.dto';
import agentPaymentService from './agentPayment.service';

const findAll = async (req: Request, res: Response, next: NextFunction) => {
  const query: any = { tenant_id: req.user?.tenant_id };
  const search = req.query.search?.toString() || '';
  const student_id = req.query.student_id?.toString() || '';
  const limit = Number(req.query.limit || 100);
  const skip = Number(req.query.skip || 0);

  if (student_id) {
    query.student_id = convertObjectID(student_id);
  }

  if (search) {
    query.$or = [{ name: { $regex: search, $options: 'i' } }];
  }

  try {
    const data = await agentPaymentService.aggregate([
      {
        $match: query,
      },

      {
        $lookup: {
          from: 'agentcommissions',
          localField: 'commission_id',
          foreignField: '_id',
          as: 'agentCommission',
        },
      },
      {
        $unwind: {
          path: '$agentCommission',
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $lookup: {
          from: 'batches',
          localField: 'agentCommission.batch_id',
          foreignField: '_id',
          as: 'batch',
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
          batch_no: {
            $ifNull: [{ $arrayElemAt: ['$batch.batch_no', 0] }, null],
          },
          acc_name: {
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
                date: 1,
                batch_no: 1,
                voucher_no: 1,
                payment_method: 1,
                acc_name: 1,
                amount: 1,
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

    const data = await agentPaymentService.aggregate([
      { $match: { _id: convertObjectID(_id), tenant_id: req.user?.tenant_id } },
      {
        $lookup: {
          from: 'agents',
          localField: 'agent_id',
          foreignField: '_id',
          as: 'agent',
        },
      },
      {
        $lookup: {
          from: 'agentcommissions',
          localField: 'commission_id',
          foreignField: '_id',
          as: 'commission',
        },
      },
      {
        $lookup: {
          from: 'batches',
          localField: 'commission.batch_id',
          foreignField: '_id',
          as: 'batch',
        },
      },
      {
        $addFields: {
          agent_name: {
            $ifNull: [{ $arrayElemAt: ['$agent.name', 0] }, null],
          },
          batch_no: {
            $ifNull: [{ $arrayElemAt: ['$batch.batch_no', 0] }, null],
          },

          commission_amount: {
            $ifNull: [
              { $arrayElemAt: ['$commission.commission_amount', 0] },
              null,
            ],
          },
        },
      },
      {
        $project: {
          agent: 0,
          commission: 0,
          batch: 0,
        },
      },
    ]);
    if (!data) {
      customError('Agent payment not found', 404);
    }
    res.json({ success: true, data: data?.[0] });
  } catch (err) {
    next(err);
  }
};

const create = async (req: Request, res: Response, next: NextFunction) => {
  const {
    acc_id,
    amount,
    payment_method,
    date,
    agent_id,
    commission_id,
    note,
    reference_no,
  } = req.body as IAgentPaymentList;
  try {
    const data = await withTransaction(async (session) => {
      const account = await accountService
        .findOne({ _id: acc_id, tenant_id: req.user?.tenant_id })
        .session(session || null);
      if (!account) customError('Account Not Found', 404);

      const commission = await agentCommissionService
        .findOne({
          _id: commission_id,
          tenant_id: req.user?.tenant_id,
        })
        .session(session || null);

      if (!commission) customError('Commission Not Found', 404);

      await agentCommissionService.update({
        _id: commission?._id as Types.ObjectId,
        tenant_id: req.user?.tenant_id,
        data: {
          paid_amount: (
            Number(commission?.paid_amount || 0) + Number(amount || 0)
          ).toFixed(2),
        },
        session,
      });

      const voucher_no = await generateCode(
        'agent_payment',
        'ANR',
        session,
        req.user?.tenant_id,
      );
      const data = await agentPaymentService.create(
        {
          acc_id,
          amount,
          agent_id,
          commission_id,
          note: note || '',
          reference_no: reference_no || '',
          payment_method,
          voucher_no,
          date,
          paid_amount:
            Number(commission?.paid_amount || 0) + Number(amount || 0),
          tenant_id: req.user?.tenant_id,
        },
        session,
      );

      await accountTransactionService.create(
        {
          account_id: acc_id,
          reference_type: 'AgentPayment',
          reference_id: data?._id,
          voucher_no: data?.voucher_no,
          amount: amount,
          type: 'DEBIT',
          description: `Agent commission payment (Agent ID: ${agent_id}) via ${payment_method}`,
          tenant_id: req.user?.tenant_id,
        },
        session,
      );

      await auditLogService.create({
        req,
        user: req.user,
        action: 'CREATE',
        entity: 'Agent Payment',
        entity_id: data?._id,
        description: `A new agent payment has been created agent_payment_id: ${data?._id?.toString()}`,
      });
      return data;
    });
    res.json({
      success: true,
      message: 'Agent payment created successfully',
      data,
    });
  } catch (err) {
    console.log(err);

    next(err);
  }
};

const update = async (req: Request, res: Response, next: NextFunction) => {
  const { _id } = req.params;
  const {
    acc_id,
    amount,
    agent_id,
    commission_id,
    reference_no,
    note,
    payment_method,
    date,
  } = req.body as IAgentPaymentList;

  try {
    checkMongooseId(_id as string);

    const findSingle = await agentPaymentService.findOne({
      _id: convertObjectID(_id as string),
      tenant_id: req.user?.tenant_id,
    });
    if (!findSingle) {
      return customError('Agent payment not found', 404);
    }

    const data = await withTransaction(async (session) => {
      const mainTx = await accountTransactionService
        .findOne({
          reference_id: findSingle._id,
          type: 'DEBIT',
          tenant_id: req.user?.tenant_id,
        })
        .session(session);

      if (!mainTx) {
        customError('Transaction not found', 404);
      }

      await accountTransactionService.update({
        _id: mainTx?._id as Types.ObjectId,
        tenant_id: req.user?.tenant_id,
        data: {
          account_id: convertObjectID(acc_id),
          amount: amount,
          description: `Agent commission payment (Agent ID: ${agent_id}) via ${payment_method}`,
        },
        session,
      });

      const oldAmount = findSingle.amount;
      const previousPaid = findSingle.paid_amount || 0;
      const diff = amount - oldAmount;
      const newPaidAmount = previousPaid + diff;

      const data = await agentPaymentService.update({
        _id: convertObjectID(_id as string),
        tenant_id: req.user?.tenant_id,
        data: {
          acc_id,
          amount,
          agent_id,
          commission_id,
          note: note || '',
          reference_no: reference_no || '',
          paid_amount: newPaidAmount,
          payment_method,
          date,
        },
        session,
      });

      return data;
    });

    const compareChange = detectChanges(
      findSingle.toObject(),
      data?.toObject(),
    );

    await auditLogService.create({
      req,
      user: req.user,
      action: 'UPDATE',
      entity: 'Agent Payment',
      entity_id: findSingle._id,
      changes: compareChange,
      description: `A new agent payment has been updated agent_payment_id: ${_id}`,
    });

    res.json({
      success: true,
      message: 'Agent payment updated successfully',
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

    const findSingle = await agentPaymentService.findOne({
      _id: convertObjectID(_id as string),
      tenant_id: req.user?.tenant_id,
    });
    if (!findSingle) {
      return customError('Agent payment not found', 404);
    }

    await withTransaction(async (session) => {
      const oldAccId = findSingle.acc_id.toString();
      const mainTx = await accountTransactionService
        .findOne({
          reference_id: findSingle._id,
          type: 'DEBIT',
          tenant_id: req.user?.tenant_id,
        })
        .session(session);

      const oldAccount = await accountService
        .findOne({
          _id: oldAccId,
          tenant_id: req.user?.tenant_id,
        })
        .session(session || null);

      if (!oldAccount) customError('Old Account Not Found', 404);

      const commission = await agentCommissionService
        .findOne({
          _id: findSingle?.commission_id,
          tenant_id: req.user?.tenant_id,
        })
        .session(session || null);

      if (!commission) customError('Commission Not Found', 404);

      await agentCommissionService.update({
        _id: commission?._id as Types.ObjectId,
        tenant_id: req.user?.tenant_id,
        data: {
          paid_amount: (
            Number(commission?.paid_amount || 0) -
            Number(findSingle?.amount || 0)
          ).toFixed(2),
        },
        session,
      });

      await agentPaymentService
        .deleteItem({
          _id: convertObjectID(_id as string),
          tenant_id: req.user?.tenant_id,
        })
        .session(session);
      await accountTransactionService
        .deleteItem({
          _id: mainTx?._id as Types.ObjectId,
          tenant_id: req.user?.tenant_id,
        })
        .session(session);
    });

    await auditLogService.create({
      req,
      user: req.user,
      action: 'DELETE',
      entity: 'Agent payment',
      entity_id: findSingle._id,
      changes: findSingle,
      description: `A new Agent payment has been deleted agent_payment_id: ${_id}`,
    });
    res.json({
      success: true,
      message: 'Agent payment deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

const select = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await agentPaymentService
      .findAll({ tenant_id: req.user?.tenant_id })
      .select('voucher_no _id');
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export default { findAll, create, findSingle, update, deleteItem, select };
