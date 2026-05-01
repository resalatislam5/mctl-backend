import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';
import agentService from '../Agent/agent.service';
import enrollmentService from '../enrollment/enrollment.service';
import studentService from '../student/student.service';

function getMonthRanges() {
  const now = new Date();

  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  return { startOfThisMonth, startOfLastMonth };
}

async function getStudentStats(tenant_id: Types.ObjectId) {
  const { startOfThisMonth, startOfLastMonth } = getMonthRanges();

  const result = await studentService.aggregate([
    { $match: { tenant_id } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        thisMonth: {
          $sum: {
            $cond: [{ $gte: ['$createdAt', startOfThisMonth] }, 1, 0],
          },
        },
        lastMonth: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $gte: ['$createdAt', startOfLastMonth] },
                  { $lt: ['$createdAt', startOfThisMonth] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  return result[0] || { total: 0, thisMonth: 0, lastMonth: 0 };
}

async function getEnrollmentStats(tenant_id: Types.ObjectId) {
  const { startOfThisMonth, startOfLastMonth } = getMonthRanges();

  const result = await enrollmentService.aggregate([
    { $match: { tenant_id } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        thisMonth: {
          $sum: {
            $cond: [{ $gte: ['$createdAt', startOfThisMonth] }, 1, 0],
          },
        },
        lastMonth: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $gte: ['$createdAt', startOfLastMonth] },
                  { $lt: ['$createdAt', startOfThisMonth] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  return result[0] || { total: 0, thisMonth: 0, lastMonth: 0 };
}

async function getAgentStats(tenant_id: Types.ObjectId) {
  const { startOfThisMonth, startOfLastMonth } = getMonthRanges();

  const result = await agentService.aggregate([
    { $match: { tenant_id } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        thisMonth: {
          $sum: {
            $cond: [{ $gte: ['$createdAt', startOfThisMonth] }, 1, 0],
          },
        },
        lastMonth: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $gte: ['$createdAt', startOfLastMonth] },
                  { $lt: ['$createdAt', startOfThisMonth] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  return result[0] || { total: 0, thisMonth: 0, lastMonth: 0 };
}
async function getPaymentStats(tenant_id: Types.ObjectId) {
  const result = await enrollmentService.aggregate([
    { $match: { tenant_id, status: 'APPROVED' } },
    {
      $addFields: {
        due_amount: { $subtract: ['$total_amount', '$total_paid'] },
      },
    },
    {
      $group: {
        _id: null,
        pendingEnrollment: {
          $sum: {
            $cond: [{ $gt: ['$total_amount', '$total_paid'] }, 1, 0],
          },
        },

        totalOutStanding: {
          $sum: {
            $cond: [
              { $gt: ['$total_amount', '$total_paid'] },
              '$due_amount',
              0,
            ],
          },
        },
      },
    },
  ]);

  return result[0] || { pendingEnrollment: 0, totalOutstanding: 0 };
}

interface AggregateResult {
  _id: {
    year: number;
    month: number;
  };
  count: number;
}

export interface TrendItem {
  month: string;
  enrollments: number;
  students: number;
}

export async function getEnrollmentStudentTrend(
  tenant_id: Types.ObjectId,
): Promise<TrendItem[]> {
  const now = new Date();

  const startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  // 🔵 Enrollments
  const enrollments: AggregateResult[] = await enrollmentService.aggregate([
    {
      $match: {
        tenant_id,
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
  ]);

  // 🟢 Students
  const students: AggregateResult[] = await studentService.aggregate([
    {
      $match: {
        tenant_id,
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
  ]);

  // 🧠 Map বানানো
  const enrollmentMap = new Map<string, number>();
  enrollments.forEach((item) => {
    const key = `${item._id.year}-${item._id.month}`;
    enrollmentMap.set(key, item.count);
  });

  const studentMap = new Map<string, number>();
  students.forEach((item) => {
    const key = `${item._id.year}-${item._id.month}`;
    studentMap.set(key, item.count);
  });

  // 📅 Final 6 months array
  const result: TrendItem[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);

    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const key = `${year}-${month}`;

    const monthName = d.toLocaleString('en-US', { month: 'short' });

    result.push({
      month: monthName,
      enrollments: enrollmentMap.get(key) || 0,
      students: studentMap.get(key) || 0,
    });
  }

  return result;
}

async function getCourseWiseEnrollment(tenant_id: Types.ObjectId) {
  const result = await enrollmentService.aggregate([
    {
      $match: { tenant_id },
    },

    // 🔥 split array
    {
      $unwind: '$course_ids',
    },

    // 🔥 group by course
    {
      $group: {
        _id: '$course_ids',
        students: { $sum: 1 },
      },
    },

    // 🔥 get course info
    {
      $lookup: {
        from: 'courses',
        localField: '_id',
        foreignField: '_id',
        as: 'course',
      },
    },

    {
      $unwind: '$course',
    },

    // 🔥 final shape
    {
      $project: {
        _id: 0,
        name: '$course.name',
        students: 1,
      },
    },

    // optional sort
    {
      $sort: { students: -1 },
    },
  ]);

  return result;
}

async function getStudentEnrollment(tenant_id: Types.ObjectId) {
  const result = await enrollmentService.aggregate([
    {
      $match: { tenant_id, status: 'APPROVED' },
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
      $unwind: '$student',
    },
    {
      $sort: { createdAt: -1 },
    },
    { $limit: 10 },

    {
      $project: {
        _id: 0,
        image: '$student.image',
        name: '$student.name',
        student_code: '$student.code',
        mobile_no: '$student.mobile_no',
        email: '$student.email',
        total_amount: '$total_amount',
        total_paid: '$total_paid',
        admission_date: '$admission_date',
      },
    },
  ]);

  return result;
}

function calcGrowth(thisMonth: number, lastMonth: number) {
  if (!lastMonth) return thisMonth > 0 ? 100 : 0;
  return ((thisMonth - lastMonth) / lastMonth) * 100;
}

const getDashboardData = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const query: any = { tenant_id: req.user?.tenant_id };

  try {
    const [
      students,
      enrollments,
      agents,
      payments,
      trend,
      course,
      student_enrollment,
    ] = await Promise.all([
      getStudentStats(req.user?.tenant_id),
      getEnrollmentStats(req.user?.tenant_id),
      getAgentStats(req.user?.tenant_id),
      getPaymentStats(req.user?.tenant_id),
      getEnrollmentStudentTrend(req.user?.tenant_id),
      getCourseWiseEnrollment(req.user?.tenant_id),
      getStudentEnrollment(req.user?.tenant_id),
    ]);

    const format = (s: {
      total: number;
      thisMonth: number;
      lastMonth: number;
    }) => ({
      ...s,
      growth: calcGrowth(s.thisMonth, s.lastMonth),
    });

    res.json({
      success: true,
      data: {
        summery: {
          students: format(students),
          enrollments: format(enrollments),
          agents: format(agents),
          payments: payments,
        },
        trend,
        course,
        student_enrollment,
      },
    });
  } catch (err) {
    next(err);
  }
};

export default { getDashboardData };
