import { NextFunction, Request, Response } from 'express';
import { IParams } from '../../../types/commonTypes';
import { checkMongooseId } from '../../../utils/checkMongooseId';
import { convertObjectID } from '../../../utils/ConvertObjectID';
import { customError } from '../../../utils/customError';
import { detectChanges } from '../../../utils/detectChanges';
import auditLogService from '../auditLog/auditLog.service';
import { generateCode } from '../counter/generateCode';
import packageService from '../package_new/package.service';
import { IEnrollmentList } from './enrollment.dto';
import enrollmentService from './enrollment.service';

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
    const data = await enrollmentService.aggregate([
      {
        $match: query,
      },
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
                admission_date: 1,
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

    const data = await enrollmentService.aggregate([
      { $match: { _id: convertObjectID(_id) } },
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
          localField: 'courses.course_id',
          foreignField: '_id',
          as: 'course_details',
        },
      },

      {
        $addFields: {
          course_names: {
            $map: {
              input: '$course_details',
              as: 'course',
              in: '$$course.name',
            },
          },
        },
      },
      {
        $lookup: {
          from: 'batches',
          localField: 'batch_id',
          foreignField: '_id',
          as: 'batch_details',
        },
      },
      {
        $lookup: {
          from: 'countries',
          localField: 'student_info.country_id',
          foreignField: '_id',
          as: 'country',
        },
      },
      {
        $lookup: {
          from: 'divisions',
          localField: 'student_info.division_id',
          foreignField: '_id',
          as: 'division',
        },
      },
      {
        $lookup: {
          from: 'districts',
          localField: 'student_info.district_id',
          foreignField: '_id',
          as: 'district',
        },
      },
      {
        $lookup: {
          from: 'students',
          localField: 'student_info.upazila_id',
          foreignField: '_id',
          as: 'upazila',
        },
      },

      {
        $unwind: {
          path: '$batch_details',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          batch_no: { $ifNull: ['$batch_details.batch_no', null] },
          'student_info.country_name': {
            $ifNull: [{ $arrayElemAt: ['$country.name', 0] }, null],
          },
          'student_info.division_name': {
            $ifNull: [{ $arrayElemAt: ['$division.name', 0] }, null],
          },
          'student_info.district_name': {
            $ifNull: [{ $arrayElemAt: ['$district.name', 0] }, null],
          },
          'student_info.upazila_name': {
            $ifNull: [{ $arrayElemAt: ['$upazila.name', 0] }, null],
          },
        },
      },
      {
        $project: {
          course_details: 0,
          batch_details: 0,
          country: 0,
          division: 0,
          district: 0,
          upazila: 0,
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
    agent_id,
    installment_type,
    meal_accommodation,
  } = req.body as IEnrollmentList;
  try {
    const code = await generateCode(
      'enrollment',
      'ENR',
      null,
      req.user?.tenant_id,
    );

    let newCourses: IEnrollmentList['courses'] = [];
    if (course_type === 'PACKAGE') {
      const data = await packageService.findOne({
        _id: convertObjectID(package_id),
        tenant_id: req.user?.tenant_id,
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
      agent_id,
      installment_type,
      meal_accommodation,
      tenant_id: req.user?.tenant_id,
    });

    await auditLogService.create({
      req,
      user: req.user,
      action: 'CREATE',
      entity: 'Enrollment',
      entity_id: data?._id,
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
    agent_id,
    installment_type,
    meal_accommodation,
  } = (req?.body || {}) as IEnrollmentList;

  try {
    checkMongooseId(_id as string);

    const findSingle = await enrollmentService.findOne({
      _id: convertObjectID(_id as string),
      tenant_id: req.user?.tenant_id,
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
        _id: convertObjectID(package_id),
        tenant_id: req.user?.tenant_id,
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

    const data = await enrollmentService.update({
      _id: convertObjectID(_id as string),
      tenant_id: req.user?.tenant_id,
      data: {
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
        agent_id,
        installment_type,
        meal_accommodation,
      },
    });

    const compareChange = detectChanges(
      findSingle.toObject(),
      data?.toObject(),
    );

    await auditLogService.create({
      req,
      user: req.user,
      action: 'UPDATE',
      entity: 'Enrollment',
      entity_id: findSingle._id,
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
      _id: convertObjectID(_id as string),
      tenant_id: req.user?.tenant_id,
    });
    if (!findSingle) {
      return customError('Enrollment not found', 404);
    }

    await enrollmentService.deleteItem({
      _id: convertObjectID(_id as string),
      tenant_id: req.user?.tenant_id,
    });

    await auditLogService.create({
      req,
      user: req.user,
      action: 'DELETE',
      entity: 'Enrollment',
      entity_id: findSingle._id,
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
  // const student_id = req.query?.student_id?.toString() || '';
  try {
    const data = await enrollmentService
      .findAll({ tenant_id: req.user?.tenant_id })
      .select('total_amount total_paid code _id');
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export default { findAll, create, findSingle, update, deleteItem, select };
