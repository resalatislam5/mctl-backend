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
import { convertObjectID } from '../../../utils/ConvertObjectID';

const findAll = async (req: Request, res: Response, next: NextFunction) => {
  const query: any = {};
  const search = req.query.search?.toString() || '';
  const student_id = req.query.student_id?.toString() || '';
  const limit = Number(req.query.limit || 100);
  const skip = Number(req.query.skip || 0);

  if (student_id) {
    query.student_id = convertObjectID(student_id);
  }
  try {
    const data = await moneyReceiptService.aggregate([
      {
        $match: query,
      },
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
                student: 0,
                batch: 0,
                enrollment: 0,
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

    const data = await moneyReceiptService.aggregate([
      { $match: { _id: convertObjectID(_id) } },
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
        $addFields: {
          student_name: {
            $ifNull: [{ $arrayElemAt: ['$student.name', 0] }, null],
          },
          student_code: {
            $ifNull: [{ $arrayElemAt: ['$student.code', 0] }, null],
          },
          enrollment_code: {
            $ifNull: [{ $arrayElemAt: ['$enrollment.code', 0] }, null],
          },
          total_amount: {
            $ifNull: [{ $arrayElemAt: ['$enrollment.total_amount', 0] }, null],
          },
          course_type: {
            $ifNull: [{ $arrayElemAt: ['$enrollment.course_type', 0] }, null],
          },
        },
      },
      {
        $project: {
          student: 0,
          enrollment: 0,
        },
      },
    ]);
    if (!data) {
      customError('Money receipt not found', 404);
    }
    res.json({ success: true, data: data?.[0] });
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

    const data = await withTransaction(async (session) => {
      const oldAccId = findSingle.acc_id.toString();
      const newAccId = acc_id;

      const oldAmount = Number(findSingle.amount || 0);
      const newAmount = Number(amount || 0);

      if (oldAccId !== newAccId) {
        const oldAccount = await accountService
          .findOne({ key: { _id: oldAccId } })
          .session(session || null);

        if (!oldAccount) customError('Old Account Not Found', 404);

        await accountService.update(
          oldAccId,
          {
            available_balance: (
              Number(oldAccount?.available_balance || 0) - oldAmount
            ).toFixed(2),
          },
          session,
        );

        const newAccount = await accountService
          .findOne({ key: { _id: newAccId } })
          .session(session || null);

        if (!newAccount) customError('New Account Not Found', 404);

        await accountService.update(
          newAccId,
          {
            available_balance: (
              Number(newAccount?.available_balance || 0) + newAmount
            ).toFixed(2),
          },
          session,
        );
      } else {
        const diff = newAmount - oldAmount;

        const account = await accountService
          .findOne({ key: { _id: newAccId } })
          .session(session || null);

        if (!account) customError('Account Not Found', 404);

        await accountService.update(
          newAccId,
          {
            available_balance: (
              Number(account?.available_balance || 0) + diff
            ).toFixed(2),
          },
          session,
        );
      }

      const data = await moneyReceiptService.update(
        _id as string,
        {
          acc_id,
          amount,
          enrollment_id,
          paid_amount,
          payment_method,
          voucher_no,
          student_id,
          date,
        },
        session,
      );
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

    await withTransaction(async (session) => {
      const oldAccId = findSingle.acc_id.toString();

      const oldAccount = await accountService
        .findOne({ key: { _id: oldAccId } })
        .session(session || null);

      if (!oldAccount) customError('Old Account Not Found', 404);

      await accountService.update(
        oldAccId,
        {
          available_balance: (
            Number(oldAccount?.available_balance || 0) -
            Number(findSingle.amount || 0)
          ).toFixed(2),
        },
        session,
      );

      await moneyReceiptService.deleteItem(_id as string);
    });

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
