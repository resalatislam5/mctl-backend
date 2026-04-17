import { NextFunction, Request, Response } from 'express';
import { IParams } from '../../../types/commonTypes';
import { checkMongooseId } from '../../../utils/checkMongooseId';
import { customError } from '../../../utils/customError';
import { detectChanges } from '../../../utils/detectChanges';
import auditLogService from '../auditLog/auditLog.service';
import { convertObjectID } from './../../../utils/ConvertObjectID';
import { ICourseProgressList } from './courseProgress.dto';
import courseProgressService from './courseProgress.service';

const findAll = async (req: Request, res: Response, next: NextFunction) => {
  const query: any = { tenant_id: req.user?.tenant_id };
  const search = req.query.search?.toString() || '';
  const student_id = req.query.student_id?.toString() || '';
  const batch_id = req.query.batch_id?.toString() || '';
  const enrollment_id = req.query.enrollment_id?.toString() || '';
  const course_id = req.query.course_id?.toString() || '';
  const limit = Number(req.query.limit || 100);
  const skip = Number(req.query.skip || 0);

  if (student_id) {
    query.student_id = convertObjectID(student_id);
  }
  if (batch_id) {
    query.batch_id = convertObjectID(batch_id);
  }
  if (enrollment_id) {
    query.enrollment_id = convertObjectID(enrollment_id);
  }

  const searchMatch = search
    ? {
        $match: {
          $or: [
            { student_name: { $regex: search, $options: 'i' } },
            { student_code: { $regex: search, $options: 'i' } },
            { batch_no: { $regex: search, $options: 'i' } },
            { enrollment_code: { $regex: search, $options: 'i' } },
          ],
        },
      }
    : null;

  if (course_id) {
    query.courses = {
      $elemMatch: {
        course_id: convertObjectID(course_id),
      },
    };
  }

  try {
    const data = await courseProgressService.aggregate([
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
        $lookup: {
          from: 'batches',
          localField: 'batch_id',
          foreignField: '_id',
          as: 'batch_info',
        },
      },
      {
        $lookup: {
          from: 'enrollments',
          localField: 'enrollment_id',
          foreignField: '_id',
          as: 'enrollment_info',
        },
      },
      {
        $addFields: {
          student_name: {
            $arrayElemAt: [{ $ifNull: ['$student_info.name', null] }, 0],
          },
          student_code: {
            $arrayElemAt: [{ $ifNull: ['$student_info.code', null] }, 0],
          },
          batch_no: {
            $arrayElemAt: [{ $ifNull: ['$batch_info.batch_no', null] }, 0],
          },
          enrollment_code: {
            $arrayElemAt: [{ $ifNull: ['$enrollment_info.code', null] }, 0],
          },
        },
      },
      ...(searchMatch ? [searchMatch] : []),
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
                student_name: 1,
                student_code: 1,
                batch_no: 1,
                enrollment_code: 1,
              },
            },
          ],
          totalCount: [
            {
              $count: 'count',
            },
          ],
        },
      },
    ]);
    res.json({
      success: true,
      total: data[0]?.totalCount[0]?.count || 0,
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

    const data = await courseProgressService.aggregate([
      { $match: { _id: convertObjectID(_id), tenant_id: req.user?.tenant_id } },
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
          courses: {
            $map: {
              input: '$courses',
              as: 'course',
              in: {
                $mergeObjects: [
                  '$$course',
                  {
                    name: {
                      $let: {
                        vars: {
                          matchedCourse: {
                            $arrayElemAt: [
                              {
                                $filter: {
                                  input: '$course_details',
                                  as: 'cd',
                                  cond: {
                                    $eq: ['$$cd._id', '$$course.course_id'],
                                  },
                                },
                              },
                              0,
                            ],
                          },
                        },
                        in: '$$matchedCourse.name',
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        $project: {
          course_details: 0,
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
  const { batch_id, student_id, courses, enrollment_id } =
    req.body as ICourseProgressList;

  try {
    const data = await courseProgressService.create({
      batch_id,
      courses,
      student_id,
      enrollment_id,
      tenant_id: req.user?.tenant_id,
    });

    await auditLogService.create({
      req,
      user: req.user,
      action: 'CREATE',
      entity: 'CourseProgress',
      entity_id: data?._id,
      description: `A new Course Progress has been created course_progress_id: ${data?._id?.toString()}`,
    });

    res.json({
      success: true,
      message: 'Course Progress created successfully',
      data,
    });
  } catch (err) {
    next(err);
  }
};

const update = async (req: Request, res: Response, next: NextFunction) => {
  const { _id } = req.params;

  const { courses } = (req?.body || {}) as ICourseProgressList;

  try {
    checkMongooseId(_id as string);

    const findSingle = await courseProgressService.findOne({
      _id: convertObjectID(_id as string),
      tenant_id: req.user?.tenant_id,
    });

    if (!findSingle) {
      return customError('Course Progress not found', 404);
    }

    const data = await courseProgressService.update({
      _id: convertObjectID(_id as string),
      tenant_id: req.user?.tenant_id,
      data: {
        courses,
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
      entity: 'CourseProgress',
      entity_id: findSingle._id,
      changes: compareChange,
      description: `A new Course Progress has been updated course_progress_id: ${_id}`,
    });

    res.json({
      success: true,
      message: 'Course Progress updated successfully',
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

    const findSingle = await courseProgressService.findOne({
      _id: convertObjectID(_id as string),
      tenant_id: req.user?.tenant_id,
    });
    if (!findSingle) {
      return customError('Course Progress not found', 404);
    }

    await courseProgressService.deleteItem({
      _id: convertObjectID(_id as string),
      tenant_id: req.user?.tenant_id,
    });

    await auditLogService.create({
      req,
      user: req.user,
      action: 'DELETE',
      entity: 'CourseProgress',
      entity_id: findSingle._id,
      changes: findSingle,
      description: `A new Course Progress has been deleted course_progress_id: ${_id}`,
    });

    res.json({
      success: true,
      message: 'Course Progress deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

export default {
  findAll,
  create,
  findSingle,
  update,
  deleteItem,
};
