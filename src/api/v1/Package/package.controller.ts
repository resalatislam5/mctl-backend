import { NextFunction, Request, Response } from 'express';
import { IParams } from '../../../types/commonTypes';
import { customError } from '../../../utils/customError';
import { checkMongooseId } from '../../../utils/checkMongooseId';
import packageService from './package.service';
import { IPackageList } from './package.dto';

const findAll = async (req: Request, res: Response, next: NextFunction) => {
  const search = req.query.search?.toString() || '';
  const limit = Number(req.query.limit || 100);
  const skip = Number(req.query.skip || 0);
  const status = req.query.status?.toString() as 'ACTIVE' | 'INACTIVE';
  try {
    const [data, total] = await Promise.all([
      packageService
        .findAll({ search, status })
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 }),
      packageService.count({ search, status }),
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

    const data = await packageService.findOne({ key: { _id: _id as string } });
    if (!data) {
      customError('Batch not found', 404);
    }
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const create = async (req: Request, res: Response, next: NextFunction) => {
  const {
    name,
    total_price,
    net_price,
    discount,
    additional_discount,
    status,
    course_ids,
  } = req.body as IPackageList;
  try {
    const data = await packageService.create({
      name,
      total_price,
      net_price,
      discount,
      course_ids,
      additional_discount,
      status,
    });

    res.json({
      success: true,
      message: 'Package created successfully',
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
  const {
    name,
    total_price,
    net_price,
    discount,
    additional_discount,
    status,
  } = req.body as IPackageList;
  try {
    checkMongooseId(_id);

    const data = await packageService.update(_id as string, {
      name,
      total_price,
      net_price,
      discount,
      additional_discount,
      status,
    });
    if (!data) customError('Package not found', 404);

    res.json({
      success: true,
      message: 'Package updated successfully',
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

    const item = await packageService.findOne({ key: { _id: _id as string } });
    if (!item) {
      return customError('Package not found', 404);
    }

    await packageService.deleteItem(_id as string);
    res.json({
      success: true,
      message: 'Package deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

const select = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await packageService
      .findAll({ status: 'ACTIVE' })
      .select('name price _id');
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export default { findAll, create, findSingle, update, deleteItem, select };
