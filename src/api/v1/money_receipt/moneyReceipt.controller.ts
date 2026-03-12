import { NextFunction, Request, Response } from 'express';
import { IParams } from '../../../types/commonTypes';
import { checkMongooseId } from '../../../utils/checkMongooseId';
import { customError } from '../../../utils/customError';
import { detectChanges } from '../../../utils/detectChanges';
import accountService from '../account/account.service';
import agentService from '../Agent/agent.service';
import auditLogService from '../auditLog/auditLog.service';
import { generateCode } from '../counter/generateCode';
import enrollmentService from '../enrollment/enrollment.service';
import { IMoneyReceiptList } from './moneyReceipt.dto';
import moneyReceiptService from './moneyReceipt.service';
import { withTransaction } from '../../../utils/withTransaction';

const findAll = async (req: Request, res: Response, next: NextFunction) => {
  const search = req.query.search?.toString() || '';
  const limit = Number(req.query.limit || 100);
  const skip = Number(req.query.skip || 0);

  try {
    // const [data, total] = await Promise.all([
    //   moneyReceiptService
    //     .findAll({ search })
    //     .limit(limit)
    //     .skip(skip)
    //     .sort({ createdAt: -1 }),
    //   moneyReceiptService.count({ search }),
    // ]);
    const data = await moneyReceiptService.aggregate([
      {
        $lookup: {
          from: 'students',
          localField: 'student_id',
          foreignField: '_id',
          as: 'student',
        },
      },
      {
        $lookup: {
          from: 'enrollments',
          localField: 'enrollment_id',
          foreignField: '_id',
          as: 'enrollment',
        },
      },
      {
        $unwind: {
          path: '$enrollment',
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $lookup: {
          from: 'batches',
          localField: 'enrollment.batch_id',
          foreignField: '_id',
          as: 'batch',
        },
      },

      {
        $addFields: {
          student_name: {
            $ifNull: [{ $arrayElemAt: ['$student.name', 0] }, null],
          },
          batch_no: {
            $ifNull: [{ $arrayElemAt: ['$batch.batch_no', 0] }, null],
          },
        },
      },
      {
        $project: {
          student: 0,
          batch: 0,
          enrollment: 0,
        },
      },
    ]);
    res.json({ success: true, total: 0, data });
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

    const data = await moneyReceiptService.findOne({
      key: { _id: _id as string },
    });
    if (!data) {
      customError('Money receipt not found', 404);
    }
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const create = async (req: Request, res: Response, next: NextFunction) => {
  const { acc_id, amount, enrollment_id, payment_method, student_id, date } =
    req.body as IMoneyReceiptList;
  try {
    const data = await withTransaction(async (session) => {
      const account = await accountService
        .findOne({
          key: { _id: acc_id },
        })
        .session(session || null);
      if (!account) customError('Account Not Found', 404);
      await accountService.update(
        acc_id,
        {
          available_balance: (
            Number(account?.available_balance) + Number(amount)
          ).toFixed(2),
        },
        session,
      );

      const enrollment = await enrollmentService
        .findOne({
          key: { _id: enrollment_id },
        })
        .session(session || null);

      if (!enrollment) customError('Enrollment Not Found', 404);

      await enrollmentService.update(
        `${enrollment?._id}`,
        {
          total_paid: (Number(enrollment?.total_paid) + Number(amount)).toFixed(
            2,
          ),
        },
        session,
      );
      if (enrollment?.agent_id) {
        const total_student = await moneyReceiptService
          .findAll({
            agent_id: `${enrollment.agent_id}`,
            batch_id: `${enrollment?.batch_id}`,
          })
          .session(session || null);

        const agent = await agentService
          .findOne({
            key: { _id: `${enrollment?.agent_id}` },
          })
          .session(session || null);
        if (total_student?.length === agent?.min_limit) {
          // TODO: joto  gulo money receipt aca sob gulo map kore.... agent ar amount sth a plus korte hobe
          const total_amount = total_student.reduce(
            (curr, prev) => curr + Number(prev?.amount || 0),
            0,
          );
          const commission = total_amount % Number(agent?.commission);
          await agentService.update(
            `${agent?._id}`,
            {
              total_amount: commission.toFixed(2),
            },
            session,
          );
        }
      }

      const voucher_no = await generateCode('money_receipt', 'MR', session);
      const data = await moneyReceiptService.create(
        {
          acc_id,
          amount,
          enrollment_id,
          payment_method,
          voucher_no,
          student_id,
          date,
          paid_amount: (
            Number(enrollment?.total_paid || 0) + Number(amount || 0)
          ).toFixed(2),
        },
        session,
      );

      // throw new Error('Custom error');
      await auditLogService.create({
        req,
        user: req.user,
        action: 'CREATE',
        entity: 'Money Receipt',
        entity_id: data?._id?.toString() as string,
        description: `A new money receipt has been created money_receipt_id: ${data?._id?.toString()}`,
      });
      return data;
    });
    res.json({
      success: true,
      message: 'Money receipt created successfully',
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
    enrollment_id,
    paid_amount,
    payment_method,
    voucher_no,
    student_id,
    date,
  } = req.body as IMoneyReceiptList;

  try {
    checkMongooseId(_id as string);

    const findSingle = await moneyReceiptService.findOne({
      key: { _id: _id as string },
    });
    if (!findSingle) {
      return customError('Money receipt not found', 404);
    }

    const data = await moneyReceiptService.update(_id as string, {
      acc_id,
      amount,
      enrollment_id,
      paid_amount,
      payment_method,
      voucher_no,
      student_id,
      date,
    });

    const compareChange = detectChanges(
      findSingle.toObject(),
      data?.toObject(),
    );

    await auditLogService.create({
      req,
      user: req.user,
      action: 'UPDATE',
      entity: 'Money Receipt',
      entity_id: _id as string,
      changes: compareChange,
      description: `A new money receipt has been updated money_receipt_id: ${_id}`,
    });

    res.json({
      success: true,
      message: 'Money receipt updated successfully',
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

    const findSingle = await moneyReceiptService.findOne({
      key: { _id: _id as string },
    });
    if (!findSingle) {
      return customError('Money receipt not found', 404);
    }

    await moneyReceiptService.deleteItem(_id as string);

    await auditLogService.create({
      req,
      user: req.user,
      action: 'DELETE',
      entity: 'Money Receipt',
      entity_id: _id as string,
      changes: findSingle,
      description: `A new money receipt has been deleted money_receipt_id: ${_id}`,
    });
    res.json({
      success: true,
      message: 'Money Receipt deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

const select = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await moneyReceiptService.findAll({}).select('voucher_no _id');
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export default { findAll, create, findSingle, update, deleteItem, select };
