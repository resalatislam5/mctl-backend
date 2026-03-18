import { NextFunction, Request, Response } from 'express';
import enrollmentService from '../enrollment/enrollment.service';
import { convertObjectID } from '../../../utils/ConvertObjectID';

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
        $project: {
          student_name: 1,
          student_code: 1,
          code: 1,
          admission_date: 1,
          total_amount: 1,
          total_paid: 1,
        },
      },
    ]);

    res.json({ success: true, data: data });
  } catch (err) {
    next(err);
  }
};

export default { studentLedger };
