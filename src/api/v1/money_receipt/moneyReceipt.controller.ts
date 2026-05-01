import { NextFunction, Request, Response } from 'express';
import { IParams } from '../../../types/commonTypes';
import { checkMongooseId } from '../../../utils/checkMongooseId';
import { convertObjectID } from '../../../utils/ConvertObjectID';
import { detectChanges } from '../../../utils/detectChanges';
import { withTransaction } from '../../../utils/withTransaction';
import accountService from '../account/account.service';
import accountTransactionService from '../accountTransaction/accountTransaction.service';
import auditLogService from '../auditLog/auditLog.service';
import { generateCode } from '../counter/generateCode';
import enrollmentService from '../enrollment/enrollment.service';
import { customError } from './../../../utils/customError';
import { IMoneyReceiptList } from './moneyReceipt.dto';
import moneyReceiptService from './moneyReceipt.service';
import { Types } from 'mongoose';

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
      { $match: { _id: convertObjectID(_id), tenant_id: req.user?.tenant_id } },
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
        $lookup: {
          from: 'accounts',
          localField: 'acc_id',
          foreignField: '_id',
          as: 'account',
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
          acc_name: {
            $ifNull: [{ $arrayElemAt: ['$account.name', 0] }, null],
          },
        },
      },
      {
        $project: {
          student: 0,
          enrollment: 0,
          account: 0,
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
          _id: acc_id,
          tenant_id: req.user?.tenant_id,
        })
        .session(session || null);

      if (!account) customError('Account Not Found', 404);

      let charge = 0;
      let isBalanceTransfer = account?.balance_transfer === 'YES';
      if (isBalanceTransfer) {
        charge =
          (Number(amount || 0) * Number(account?.charge_percent || 0)) / 100;
      }

      const enrollment = await enrollmentService
        .findOne({
          _id: convertObjectID(enrollment_id),
          tenant_id: req.user?.tenant_id,
        })
        .session(session || null);

      if (!enrollment) customError('Enrollment Not Found', 404);

      await enrollmentService.update({
        _id: convertObjectID(enrollment_id),
        tenant_id: req.user?.tenant_id,
        data: {
          total_paid: Number(enrollment?.total_paid) + Number(amount),
        },
        session,
      });

      const voucher_no = await generateCode(
        'money_receipt',
        'MR',
        session,
        req.user?.tenant_id,
      );
      const data = await moneyReceiptService.create(
        {
          acc_id,
          amount,
          enrollment_id,
          payment_method,
          voucher_no,
          student_id,
          date,
          charge: charge,
          paid_amount:
            Number(enrollment?.total_paid || 0) + Number(amount || 0),
          tenant_id: req.user?.tenant_id,
        },
        session,
      );

      await accountTransactionService.create(
        {
          account_id: acc_id,
          reference_type: 'MoneyReceipt',
          reference_id: data?._id,
          voucher_no: data?.voucher_no,
          amount: Number(amount),
          type: 'CREDIT',
          description: `Payment received from student (${student_id}) via ${payment_method}`,
          tenant_id: req.user?.tenant_id,
          is_balance_transfer: false,
        },
        session,
      );

      if (charge > 0) {
        await accountTransactionService.create(
          {
            account_id: acc_id,
            reference_type: 'MoneyReceipt',
            reference_id: data?._id,
            voucher_no: data?.voucher_no,
            amount: charge,
            type: 'DEBIT',
            description: `Transaction charge for student (${student_id}) payment via ${payment_method}`,
            tenant_id: req.user?.tenant_id,
          },
          session,
        );
      }

      if (isBalanceTransfer) {
        await accountTransactionService.create(
          {
            account_id: acc_id,
            reference_type: 'MoneyReceipt',
            reference_id: data?._id,
            voucher_no: data?.voucher_no,
            amount: Number(amount) - charge,
            type: 'DEBIT',
            description: `Auto transfer to account (${account!.transfer_acc_id}) [Student: ${student_id}]`,
            tenant_id: req.user?.tenant_id,
            is_balance_transfer: true,
          },
          session,
        );
        await accountTransactionService.create(
          {
            account_id: account!.transfer_acc_id,
            reference_type: 'MoneyReceipt',
            reference_id: data?._id,
            voucher_no: data?.voucher_no,
            amount: Number(amount) - charge,
            type: 'CREDIT',
            description: `Auto transfer from account (${acc_id}) [Student: ${student_id}]`,
            tenant_id: req.user?.tenant_id,
            is_balance_transfer: true,
          },
          session,
        );
      }

      await auditLogService.create({
        req,
        user: req.user,
        action: 'CREATE',
        entity: 'Money Receipt',
        entity_id: data?._id,
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
  const { acc_id, amount, enrollment_id, payment_method, student_id, date } =
    req.body as IMoneyReceiptList;

  try {
    checkMongooseId(_id as string);

    const findSingle = await moneyReceiptService.findOne({
      _id: convertObjectID(_id as string),
      tenant_id: req.user?.tenant_id,
    });
    if (!findSingle) {
      return customError('Money receipt not found', 404);
    }

    const data = await withTransaction(async (session) => {
      const account = await accountService.findOne({
        tenant_id: req.user?.tenant_id,
        _id: convertObjectID(acc_id),
      });
      if (!account) customError('Account not found', 404);

      let charge = 0;
      const isBalanceTransfer = account?.balance_transfer === 'YES';

      if (isBalanceTransfer) {
        charge = (amount * Number(account?.charge_percent || 0)) / 100;
      }

      await accountTransactionService
        .deleteMany({ reference_id: findSingle._id })
        .session(session);

      await accountTransactionService.create(
        {
          account_id: convertObjectID(acc_id),
          reference_type: 'MoneyReceipt',
          reference_id: findSingle._id,
          voucher_no: findSingle.voucher_no,
          amount: amount,
          type: 'CREDIT',
          description: `Payment received from student (${student_id}) via ${payment_method}`,
          tenant_id: req.user?.tenant_id,
          is_balance_transfer: false,
        },
        session,
      );

      if (charge > 0) {
        await accountTransactionService.create(
          {
            account_id: convertObjectID(acc_id),
            reference_type: 'MoneyReceipt',
            reference_id: findSingle._id,
            voucher_no: findSingle.voucher_no,
            amount: charge,
            type: 'DEBIT',
            description: `Transaction charge for student (${student_id}) payment via ${payment_method}`,
            tenant_id: req.user?.tenant_id,
            is_balance_transfer: false,
          },
          session,
        );
      }

      if (isBalanceTransfer) {
        await accountTransactionService.create(
          {
            account_id: convertObjectID(acc_id),
            reference_type: 'MoneyReceipt',
            reference_id: findSingle._id,
            voucher_no: findSingle.voucher_no,
            amount: amount - charge,
            type: 'DEBIT',
            description: `Auto transfer to account (${account!.transfer_acc_id}) [Student: ${student_id}]`,
            tenant_id: req.user?.tenant_id,
            is_balance_transfer: true,
          },
          session,
        );
        await accountTransactionService.create(
          {
            account_id: account!.transfer_acc_id,
            reference_type: 'MoneyReceipt',
            reference_id: findSingle._id,
            voucher_no: findSingle.voucher_no,
            amount: amount - charge,
            type: 'CREDIT',
            description: `Auto transfer from account (${acc_id}) [Student: ${student_id}]`,
            tenant_id: req.user?.tenant_id,
            is_balance_transfer: true,
          },
          session,
        );
      }

      // ── 5. UPDATE enrollment total_paid ───────────────────────────────────

      const enrollment = await enrollmentService
        .findOne({
          _id: convertObjectID(enrollment_id),
          tenant_id: req.user?.tenant_id,
        })
        .session(session || null);
      if (!enrollment) customError('Enrollment Not Found', 404);

      const amountDiff = amount - (findSingle?.amount || 0);

      await enrollmentService.update({
        _id: convertObjectID(enrollment_id),
        tenant_id: req.user?.tenant_id,
        data: {
          total_paid: Number(enrollment?.total_paid) + amountDiff,
        },
        session,
      });

      const data = await moneyReceiptService.update({
        _id: convertObjectID(_id as string),
        tenant_id: req.user?.tenant_id,
        data: {
          acc_id,
          amount,
          enrollment_id,
          payment_method,
          voucher_no: findSingle.voucher_no,
          student_id,
          date,
          charge: charge,
          paid_amount: Number(enrollment?.total_paid || 0) + amountDiff,
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
      entity: 'Money Receipt',
      entity_id: findSingle._id,
      changes: compareChange,
      description: `A money receipt has been updated money_receipt_id: ${_id}`,
    });

    res.json({
      success: true,
      message: 'Money receipt updated successfully',
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

    const findSingle = await moneyReceiptService.findOne({
      _id: convertObjectID(_id as string),
      tenant_id: req.user?.tenant_id,
    });
    if (!findSingle) {
      return customError('Money receipt not found', 404);
    }

    await withTransaction(async (session) => {
      const enrollment = await enrollmentService
        .findOne({
          _id: findSingle?.enrollment_id,
          tenant_id: req.user?.tenant_id,
        })
        .session(session || null);
      if (!enrollment) customError('Enrollment Not Found', 404);

      await enrollmentService.update({
        _id: enrollment?._id as Types.ObjectId,
        tenant_id: req.user?.tenant_id,
        data: {
          total_paid: Number(enrollment?.total_paid) - findSingle?.amount,
        },
        session,
      });

      await accountTransactionService
        .deleteMany({ reference_id: findSingle._id })
        .session(session);

      await moneyReceiptService
        .deleteItem({
          _id: convertObjectID(_id as string),
          tenant_id: req.user?.tenant_id,
        })
        .session(session);
    });

    await auditLogService.create({
      req,
      user: req.user,
      action: 'DELETE',
      entity: 'Money Receipt',
      entity_id: findSingle._id,
      changes: findSingle,
      description: `A money receipt has been deleted money_receipt_id: ${_id}`,
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
    const data = await moneyReceiptService
      .findAll({ tenant_id: req.user?.tenant_id })
      .select('voucher_no _id');
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export default { findAll, create, findSingle, update, deleteItem, select };
