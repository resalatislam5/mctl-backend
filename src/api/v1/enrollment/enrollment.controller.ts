import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { IParams } from '../../../types/commonTypes';
import { checkMongooseId } from '../../../utils/checkMongooseId';
import { customError } from '../../../utils/customError';
import { detectChanges } from '../../../utils/detectChanges';
import auditLogService from '../auditLog/auditLog.service';
import { generateCode } from '../counter/generateCode';
import packageService from '../package_new/package.service';
import { IEnrollmentList } from './enrollment.dto';
import enrollmentService from './enrollment.service';

const findAll = async (req: Request, res: Response, next: NextFunction) => {
  const search = req.query.search?.toString() || '';
  const limit = Number(req.query.limit || 100);
  const skip = Number(req.query.skip || 0);
  try {
    const data = await enrollmentService.aggregate([
      {
        $lookup: {
          from: 'students',
          localField: 'student_id',
          foreignField: '_id',
          as: 'student_info',
        },
      },
      {
        $unwind: {
          path: '$student_info',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'batches',
          localField: 'batch_id',
          foreignField: '_id',
          as: 'batches',
        },
      },
      {
        $unwind: {
          path: '$batches',
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $addFields: {
          student_name: { $ifNull: ['$student_info.name', null] },
          batch_no: { $ifNull: ['$batches.batch_no', null] },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: skip,
      },
      { $limit: limit },
      {
        $facet: {
          data: [
            {
              $project: {
                _id: 1,
                student_id: 1,
                batch_id: 1,
                student_name: 1,
                code: 1,
                batch_no: 1,
                course_mode: 1,
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

    const objId = new mongoose.Types.ObjectId(_id);
    const data = await enrollmentService.aggregate([
      { $match: { _id: objId } },
      {
        $lookup: {
          from: 'students',
          localField: 'student_id',
          foreignField: '_id',
          as: 'student_info',
        },
      },
      {
        $unwind: {
          path: '$student_info',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'courses',
          localField: 'course_ids',
          foreignField: '_id',
          as: 'courses',
        },
      },

      {
        $addFields: {
          course_names: {
            $map: {
              input: '$courses',
              as: 'course',
              in: '$$course.name',
            },
          },
        },
      },
      {
        $project: {
          courses: 0,
        },
      },
    ]);

    if (!data[0]) {
      customError('Enrollment not found', 404);
    }
    res.json({ success: true, data: data[0] });
  } catch (err) {
    next(err);
  }
};

const create = async (req: Request, res: Response, next: NextFunction) => {
  const {
    additional_discount,
    admission_date,
    batch_id,
    course_mode,
    courses,
    discount,
    installment_date,
    student_id,
    total_price,
    total_amount,
    total_paid,
    course_type,
    package_id,
    course_ids,
  } = req.body as IEnrollmentList;
  try {
    const code = await generateCode('enrollment', 'ENR');

    let newCourses: IEnrollmentList['courses'] = [];
    if (course_type === 'PACKAGE') {
      const data = await packageService.findOne({
        key: { _id: `${package_id}` },
      });
      newCourses =
        data?.course_ids?.map((item) => ({
          course_id: item,
          status: 'NO',
          soft_copy: 'NO',
        })) || [];
    }

    if (course_type === 'SPECIFIC') {
      newCourses = course_ids?.map((item) => ({
        course_id: item,
        status: 'NO',
        soft_copy: 'NO',
      }));
    }

    console.log(courses);

    const data = await enrollmentService.create({
      additional_discount,
      admission_date,
      batch_id,
      code,
      course_mode,
      courses: newCourses,
      discount,
      installment_date,
      student_id,
      total_amount,
      total_price,
      total_paid,
      course_type,
      package_id,
      course_ids,
    });

    await auditLogService.create({
      req,
      user: req.user,
      action: 'CREATE',
      entity: 'Enrollment',
      entity_id: data?._id?.toString() as string,
      description: `A new Enrollment has been created Enrollment_id: ${data?._id?.toString()}`,
    });

    res.json({
      success: true,
      message: 'Enrollment created successfully',
      data,
    });
  } catch (err) {
    next(err);
  }
};

const update = async (req: Request, res: Response, next: NextFunction) => {
  const { _id } = req.params;

  const {
    additional_discount,
    admission_date,
    batch_id,
    code,
    course_mode,
    discount,
    installment_date,
    student_id,
    total_amount,
    total_price,
    total_paid,
    course_type,
    package_id,
    course_ids,
  } = (req?.body || {}) as IEnrollmentList;

  try {
    checkMongooseId(_id as string);

    const findSingle = await enrollmentService.findOne({
      key: { _id: _id as string },
    });
    if (!findSingle) {
      return customError('Enrollment not found', 404);
    }

    let newCourses: IEnrollmentList['courses'] = [];

    // Get existing course statuses and soft_copy in a Map
    const existingCoursesMap = new Map<
      string,
      { status: 'YES' | 'NO'; soft_copy: 'YES' | 'NO' }
    >();
    findSingle.courses.forEach((c) => {
      existingCoursesMap.set(c.course_id.toString(), {
        status: c.status,
        soft_copy: c.soft_copy,
      });
    });

    if (course_type === 'PACKAGE') {
      const data = await packageService.findOne({
        key: { _id: `${package_id}` },
      });

      newCourses =
        data?.course_ids?.map((item) => {
          const existing = existingCoursesMap.get(item.toString());
          return {
            course_id: item,
            status: existing?.status || 'NO',
            soft_copy: existing?.soft_copy || 'NO',
          };
        }) || [];
    }

    if (course_type === 'SPECIFIC') {
      newCourses =
        course_ids?.map((item) => {
          const existing = existingCoursesMap.get(item.toString());
          return {
            course_id: item,
            status: existing?.status || 'NO',
            soft_copy: existing?.soft_copy || 'NO',
          };
        }) || [];
    }

    const data = await enrollmentService.update(_id as string, {
      additional_discount,
      admission_date,
      batch_id,
      code,
      course_mode,
      courses: newCourses,
      discount,
      installment_date,
      student_id,
      total_amount,
      total_price,
      total_paid,
      course_type,
      package_id,
      course_ids: course_type === 'SPECIFIC' ? course_ids : [],
    });

    const compareChange = detectChanges(
      findSingle.toObject(),
      data?.toObject(),
    );

    await auditLogService.create({
      req,
      user: req.user,
      action: 'DELETE',
      entity: 'Enrollment',
      entity_id: _id as string,
      changes: compareChange,
      description: `A new Enrollment has been deleted Enrollment_id: ${_id}`,
    });

    res.json({
      success: true,
      message: 'Enrollment updated successfully',
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

    const findSingle = await enrollmentService.findOne({
      key: { _id: _id as string },
    });
    if (!findSingle) {
      return customError('Enrollment not found', 404);
    }

    await enrollmentService.deleteItem(_id as string);

    await auditLogService.create({
      req,
      user: req.user,
      action: 'DELETE',
      entity: 'Enrollment',
      entity_id: _id as string,
      changes: findSingle,
      description: `A new Enrollment has been deleted Enrollment_id: ${_id}`,
    });

    res.json({
      success: true,
      message: 'Enrollment deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

const select = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await enrollmentService.findAll({}).select('name code _id');
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export default { findAll, create, findSingle, update, deleteItem, select };
