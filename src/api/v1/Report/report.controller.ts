import { NextFunction, Request, Response } from 'express';
import enrollmentService from '../enrollment/enrollment.service';
import { convertObjectID } from '../../../utils/ConvertObjectID';
import expenseHistoryService from '../expenseHistory/expenseHistory.service';

const studentLedger = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const batch_id = req.query?.batch_id?.toString() || '';

  try {
    const data = await enrollmentService.aggregate([
      {
        $match: { batch_id: convertObjectID(batch_id) },
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
          from: 'batches',
          localField: 'batch_id',
          foreignField: '_id',
          as: 'batch',
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
          batch_no: {
            $ifNull: [{ $arrayElemAt: ['$batch.batch_no', 0] }, null],
          },
        },
      },

      {
        $facet: {
          data: [
            {
              $project: {
                student_name: 1,
                student_code: 1,
                code: 1,
                admission_date: 1,
                total_amount: 1,
                total_paid: 1,
              },
            },
          ],
          totalCount: [{ $count: 'count' }],
        },
      },
    ]);

    res.json({
      success: true,
      total: data[0]?.totalCount?.[0].count,
      data: data[0]?.data,
    });
  } catch (err) {
    next(err);
  }
};

const expenseReport = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const query: any = {};
  const from_date = req.query.from_date as string;
  const to_date = req.query.to_date as string;
  const head_id = req.query.head_id as string;

  if (from_date || to_date) {
    const dateFilter: any = {};

    if (from_date) {
      dateFilter.$gte = new Date(from_date);
    }

    if (to_date) {
      const toDate = new Date(to_date);
      toDate.setHours(23, 59, 59, 999); // include entire day
      dateFilter.$lte = toDate;
    }

    query.createdAt = dateFilter;
  }

  if (head_id) {
    query.expense_details = {
      $elemMatch: {
        head_id: convertObjectID(head_id),
      },
    };
  }
  try {
    const data = await expenseHistoryService.aggregate([
      {
        $match: query,
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
        $lookup: {
          from: 'heads',
          localField: 'expense_details.head_id',
          foreignField: '_id',
          as: 'head',
        },
      },
      {
        $addFields: {
          account_name: {
            $ifNull: [{ $arrayElemAt: ['$account.name', 0] }, null],
          },
          expense_head_names: {
            $map: {
              input: '$head',
              as: 'item',
              in: '$$item.name',
            },
          },
        },
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
                expense_head_names: 1,
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

export default { studentLedger, expenseReport };
