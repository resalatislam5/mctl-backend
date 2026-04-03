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

      let charge = 0;
      let isBalanceTransfer = account?.balance_transfer === 'YES';
      if (isBalanceTransfer) {
        charge =
          (Number(amount || 0) * Number(account?.charge_percent || 0)) / 100;
        const transferAccount = await accountService
          .findOne({
            key: { _id: account!.transfer_acc_id },
          })
          .session(session || null);

        if (!transferAccount) customError('Transfer Account Not Found', 404);

        await accountService.update(
          account!.transfer_acc_id,
          {
            available_balance: (
              Number(transferAccount?.available_balance || 0) +
              (Number(amount || 0) - charge)
            ).toFixed(2),
          },
          session,
        );
      } else {
        await accountService.update(
          acc_id,
          {
            available_balance: (
              Number(account?.available_balance || 0) +
              (Number(amount || 0) - charge)
            ).toFixed(2),
          },
          session,
        );
      }

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
          charge: charge.toFixed(2),
          paid_amount: (
            Number(enrollment?.total_paid || 0) + Number(amount || 0)
          ).toFixed(2),
        },
        session,
      );

      await accountTransactionService.create(
        {
          account_id: acc_id,
          reference_type: 'MoneyReceipt',
          reference_id: data?._id,
          voucher_no: data?.voucher_no,
          amount: (Number(amount) - charge).toFixed(2),
          type: 'CREDIT',
          description: `Payment received from student (${student_id}) via ${payment_method}`,
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
            amount: charge.toFixed(2),
            type: 'DEBIT',
            description: `Transaction charge for student (${student_id}) payment via ${payment_method}`,
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
            amount: (Number(amount) - charge).toFixed(2),
            type: 'DEBIT',
            description: `Auto transfer to account (${account!.transfer_acc_id}) [Student: ${student_id}]`,
          },
          session,
        );
        await accountTransactionService.create(
          {
            account_id: account!.transfer_acc_id,
            reference_type: 'MoneyReceipt',
            reference_id: data?._id,
            voucher_no: data?.voucher_no,
            amount: (Number(amount) - charge).toFixed(2),
            type: 'CREDIT',
            description: `Auto transfer from account (${acc_id}) [Student: ${student_id}]`,
          },
          session,
        );
      }

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
      const oldCharge = Number(findSingle.charge || 0);

      // ── 1. REVERSE old account balances ──────────────────────────────────

      const oldAccount = await accountService
        .findOne({ key: { _id: oldAccId } })
        .session(session || null);
      if (!oldAccount) customError('Old Account Not Found', 404);

      const wasBalanceTransfer = oldAccount?.balance_transfer === 'YES';

      if (wasBalanceTransfer) {
        // Reverse the transfer account credit
        const oldTransferAccount = await accountService
          .findOne({ key: { _id: oldAccount!.transfer_acc_id } })
          .session(session || null);
        if (!oldTransferAccount)
          customError('Old Transfer Account Not Found', 404);

        await accountService.update(
          oldAccount!.transfer_acc_id,
          {
            available_balance: (
              Number(oldTransferAccount?.available_balance || 0) -
              (oldAmount - oldCharge)
            ).toFixed(2),
          },
          session,
        );
      } else {
        // Reverse the direct account credit
        await accountService.update(
          oldAccId,
          {
            available_balance: (
              Number(oldAccount?.available_balance || 0) -
              (oldAmount - oldCharge)
            ).toFixed(2),
          },
          session,
        );
      }

      // ── 2. APPLY new account balances (mirrors create logic) ─────────────

      const newAccount = await accountService
        .findOne({ key: { _id: newAccId } })
        .session(session || null);
      if (!newAccount) customError('New Account Not Found', 404);

      let newCharge = 0;
      const isBalanceTransfer = newAccount?.balance_transfer === 'YES';

      if (isBalanceTransfer) {
        newCharge = (newAmount * Number(newAccount?.charge_percent || 0)) / 100;

        const newTransferAccount = await accountService
          .findOne({ key: { _id: newAccount!.transfer_acc_id } })
          .session(session || null);
        if (!newTransferAccount) customError('Transfer Account Not Found', 404);

        await accountService.update(
          newAccount!.transfer_acc_id,
          {
            available_balance: (
              Number(newTransferAccount?.available_balance || 0) +
              (newAmount - newCharge)
            ).toFixed(2),
          },
          session,
        );
      } else {
        await accountService.update(
          newAccId,
          {
            available_balance: (
              Number(newAccount?.available_balance || 0) +
              (newAmount - newCharge)
            ).toFixed(2),
          },
          session,
        );
      }

      // ── 3. DELETE all old transactions for this receipt ───────────────────

      await accountTransactionService
        .deleteMany({ reference_id: findSingle._id })
        .session(session);

      // ── 4. RECREATE transactions (mirrors create logic exactly) ───────────

      await accountTransactionService.create(
        {
          account_id: newAccId,
          reference_type: 'MoneyReceipt',
          reference_id: findSingle._id,
          voucher_no: findSingle.voucher_no,
          amount: (newAmount - newCharge).toFixed(2),
          type: 'CREDIT',
          description: `Payment received from student (${student_id}) via ${payment_method}`,
        },
        session,
      );

      if (newCharge > 0) {
        await accountTransactionService.create(
          {
            account_id: newAccId,
            reference_type: 'MoneyReceipt',
            reference_id: findSingle._id,
            voucher_no: findSingle.voucher_no,
            amount: newCharge.toFixed(2),
            type: 'DEBIT',
            description: `Transaction charge for student (${student_id}) payment via ${payment_method}`,
          },
          session,
        );
      }

      if (isBalanceTransfer) {
        await accountTransactionService.create(
          {
            account_id: newAccId,
            reference_type: 'MoneyReceipt',
            reference_id: findSingle._id,
            voucher_no: findSingle.voucher_no,
            amount: (newAmount - newCharge).toFixed(2),
            type: 'DEBIT',
            description: `Auto transfer to account (${newAccount!.transfer_acc_id}) [Student: ${student_id}]`,
          },
          session,
        );
        await accountTransactionService.create(
          {
            account_id: newAccount!.transfer_acc_id,
            reference_type: 'MoneyReceipt',
            reference_id: findSingle._id,
            voucher_no: findSingle.voucher_no,
            amount: (newAmount - newCharge).toFixed(2),
            type: 'CREDIT',
            description: `Auto transfer from account (${newAccId}) [Student: ${student_id}]`,
          },
          session,
        );
      }

      // ── 5. UPDATE enrollment total_paid ───────────────────────────────────

      const enrollment = await enrollmentService
        .findOne({ key: { _id: enrollment_id } })
        .session(session || null);
      if (!enrollment) customError('Enrollment Not Found', 404);

      const amountDiff = newAmount - oldAmount;

      await enrollmentService.update(
        `${enrollment?._id}`,
        {
          total_paid: (Number(enrollment?.total_paid) + amountDiff).toFixed(2),
        },
        session,
      );

      // ── 6. UPDATE money receipt record ────────────────────────────────────

      const data = await moneyReceiptService.update(
        _id as string,
        {
          acc_id,
          amount,
          enrollment_id,
          // paid_amount,
          payment_method,
          voucher_no: findSingle.voucher_no,
          student_id,
          date,
          charge: newCharge.toFixed(2),
          paid_amount: (
            Number(enrollment?.total_paid || 0) + newAmount
          ).toFixed(2),
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
      key: { _id: _id as string },
    });
    if (!findSingle) {
      return customError('Money receipt not found', 404);
    }

    await withTransaction(async (session) => {
      const oldAccId = findSingle.acc_id.toString();
      const oldAmount = Number(findSingle.amount || 0);
      const oldCharge = Number(findSingle.charge || 0);

      // ── 1. REVERSE account balances ───────────────────────────────────────

      const oldAccount = await accountService
        .findOne({ key: { _id: oldAccId } })
        .session(session || null);
      if (!oldAccount) customError('Old Account Not Found', 404);

      const wasBalanceTransfer = oldAccount?.balance_transfer === 'YES';

      if (wasBalanceTransfer) {
        const transferAccount = await accountService
          .findOne({ key: { _id: oldAccount!.transfer_acc_id } })
          .session(session || null);
        if (!transferAccount) customError('Transfer Account Not Found', 404);

        await accountService.update(
          oldAccount!.transfer_acc_id,
          {
            available_balance: (
              Number(transferAccount?.available_balance || 0) -
              (oldAmount - oldCharge)
            ).toFixed(2),
          },
          session,
        );
      } else {
        await accountService.update(
          oldAccId,
          {
            available_balance: (
              Number(oldAccount?.available_balance || 0) -
              (oldAmount - oldCharge)
            ).toFixed(2),
          },
          session,
        );
      }

      // ── 2. REVERSE enrollment total_paid ──────────────────────────────────

      const enrollment = await enrollmentService
        .findOne({
          key: { _id: findSingle?.enrollment_id.toString() },
        })
        .session(session || null);
      if (!enrollment) customError('Enrollment Not Found', 404);

      await enrollmentService.update(
        `${enrollment?._id}`,
        {
          total_paid: (Number(enrollment?.total_paid) - oldAmount).toFixed(2),
        },
        session,
      );

      // ── 3. DELETE all transactions and receipt ────────────────────────────

      await accountTransactionService
        .deleteMany({ reference_id: findSingle._id })
        .session(session);

      await moneyReceiptService.deleteItem(_id as string).session(session);
    });

    await auditLogService.create({
      req,
      user: req.user,
      action: 'DELETE',
      entity: 'Money Receipt',
      entity_id: _id as string,
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
    const data = await moneyReceiptService.findAll({}).select('voucher_no _id');
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export default { findAll, create, findSingle, update, deleteItem, select };
