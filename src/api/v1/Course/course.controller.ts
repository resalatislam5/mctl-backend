import { NextFunction, Request, Response } from 'express';
import { IParams } from '../../../types/commonTypes';
import { customError } from '../../../utils/customError';
import { checkMongooseId } from '../../../utils/checkMongooseId';
import courseService from './course.service';
import { ICourseList } from './course.dto';

const findAll = async (req: Request, res: Response, next: NextFunction) => {
  const search = req.query.search?.toString() || '';
  const limit = Number(req.query.limit || 100);
  const skip = Number(req.query.skip || 0);
  const status = req.query.status?.toString() as 'ACTIVE' | 'INACTIVE';
  try {
    const [data, total] = await Promise.all([
      courseService
        .findAll({ search, status })
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 }),
      courseService.count({ search, status }),
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

    const data = await courseService.findOne({ key: { _id: _id as string } });
    if (!data) {
      customError('Batch not found', 404);
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

const update = async (
  req: Request<IParams>,
  res: Response,
  next: NextFunction,
) => {
  const { _id } = req.params;
  const { name, price, status } = req.body as ICourseList;
  try {
    checkMongooseId(_id);

    const data = await courseService.update(_id as string, {
      name,
      price,
      status,
    });
    if (!data) customError('Course not found', 404);

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: data,
    });
  } catch (err) {
    next(err);
  }
};

const deleteItem = async (
  req: Request<IParams>,
  res: Response,
  next: NextFunction,
) => {
  const { _id } = req.params;

  try {
    checkMongooseId(_id);

    const item = await courseService.findOne({ key: { _id: _id as string } });
    if (!item) {
      return customError('Batch not found', 404);
    }

    await courseService.deleteItem(_id as string);
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
      .findAll({ status: 'ACTIVE' })
      .select('name price _id');
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export default { findAll, create, findSingle, update, deleteItem, select };
