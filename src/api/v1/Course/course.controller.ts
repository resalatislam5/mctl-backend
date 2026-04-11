import { NextFunction, Request, Response } from 'express';
import { IParams } from '../../../types/commonTypes';
import { customError } from '../../../utils/customError';
import { checkMongooseId } from '../../../utils/checkMongooseId';
import courseService from './course.service';
import { ICourseList } from './course.dto';
import auditLogService from '../auditLog/auditLog.service';
import { detectChanges } from '../../../utils/detectChanges';
import { convertObjectID } from '../../../utils/ConvertObjectID';

const findAll = async (req: Request, res: Response, next: NextFunction) => {
  const search = req.query.search?.toString() || '';
  const limit = Number(req.query.limit || 100);
  const skip = Number(req.query.skip || 0);
  const status = req.query.status?.toString() as 'ACTIVE' | 'INACTIVE';
  try {
    const [data, total] = await Promise.all([
      courseService
        .findAll({ search, status, tenant_id: req.user?.tenant_id })
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 }),
      courseService.count({ search, status, tenant_id: req.user?.tenant_id }),
    ]);
    res.json({ success: true, total, data });
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

    const data = await courseService.findOne({
      _id: convertObjectID(_id as string),
      tenant_id: req.user?.tenant_id,
    });
    if (!data) {
      customError('Course not found', 404);
    }
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const create = async (req: Request, res: Response, next: NextFunction) => {
  const { name, price, status } = req.body as ICourseList;
  try {
    const data = await courseService.create({
      name,
      price,
      status,
      tenant_id: req.user?.tenant_id,
    });

    await auditLogService.create({
      req,
      user: req.user,
      action: 'CREATE',
      entity: 'Course',
      entity_id: data?._id,
      description: `A new course has been created course_id: ${data?._id?.toString()}`,
    });

    res.json({
      success: true,
      message: 'Course created successfully',
      data,
    });
  } catch (err) {
    next(err);
  }
};

const update = async (req: Request, res: Response, next: NextFunction) => {
  const { _id } = req.params;
  const { name, price, status } = req.body as ICourseList;
  try {
    checkMongooseId(_id as string);
    const findSingle = await courseService.findOne({
      _id: convertObjectID(_id as string),
      tenant_id: req.user?.tenant_id,
    });
    if (!findSingle) {
      return customError('Course not found', 404);
    }
    const data = await courseService.update({
      _id: convertObjectID(_id as string),
      tenant_id: req.user?.tenant_id,
      data: {
        name,
        price,
        status,
      },
    });
    if (!data) customError('Course not found', 404);

    const compareChange = detectChanges(
      findSingle.toObject(),
      data?.toObject(),
    );
    await auditLogService.create({
      req,
      user: req.user,
      action: 'UPDATE',
      entity: 'Course',
      entity_id: findSingle._id,
      changes: compareChange,
      description: `A new course has been updated course_id: ${_id}`,
    });

    res.json({
      success: true,
      message: 'Course updated successfully',
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

    const findSingle = await courseService.findOne({
      _id: convertObjectID(_id as string),
      tenant_id: req.user?.tenant_id,
    });
    if (!findSingle) {
      return customError('Course not found', 404);
    }

    await courseService.deleteItem({
      _id: convertObjectID(_id as string),
      tenant_id: req.user?.tenant_id,
    });

    await auditLogService.create({
      req,
      user: req.user,
      action: 'DELETE',
      entity: 'Course',
      entity_id: findSingle._id,
      changes: findSingle,
      description: `A new course has been deleted course_id: ${_id}`,
    });

    res.json({
      success: true,
      message: 'Batch deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

const select = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await courseService
      .findAll({ status: 'ACTIVE', tenant_id: req.user?.tenant_id })
      .select('name price _id');
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export default { findAll, create, findSingle, update, deleteItem, select };
