import { NextFunction, Request, Response } from 'express';
import { IParams } from '../../../types/commonTypes';
import { customError } from '../../../utils/customError';

import { checkMongooseId } from '../../../utils/checkMongooseId';
import upazilaService from './upazila.service';
import { IUpazilaList } from './upazila.dto';

const findAll = async (req: Request, res: Response, next: NextFunction) => {
  const search = req.query.search?.toString() || '';
  const limit = Number(req.query.limit || 100);
  const skip = Number(req.query.skip || 0);
  const district_id = req.query.district_id?.toString() || '';
  const status = req.query.status?.toString() as 'ACTIVE' | 'INACTIVE';

  try {
    const [data, total] = await Promise.all([
      upazilaService
        .findAll({ search, district_id, status })
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 }),
      upazilaService.count({ search, district_id, status }),
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

    const data = await upazilaService.findOne({ key: { _id: _id as string } });
    if (!data) {
      customError('Upazila not found', 404);
    }
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const create = async (req: Request, res: Response, next: NextFunction) => {
  const { name, code, district_id, status } = req.body as IUpazilaList;
  try {
    const data = await upazilaService.create({
      name,
      code,
      district_id,
      status,
    });

    res.json({
      success: true,
      message: 'Upazila created successfully',
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
  const { name, code, status } = req.body;
  try {
    checkMongooseId(_id);

    const data = await upazilaService.update(_id as string, {
      name,
      code,
      status,
    });
    if (!data) customError('Upazila not found', 404);
    res.json({
      success: true,
      message: 'Upazila updated successfully',
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

    const item = await upazilaService.findOne({ key: { _id: _id as string } });
    if (!item) {
      return customError('Upazila not found', 404);
    }

    await upazilaService.deleteItem(_id as string);
    res.json({
      success: true,
      message: 'Upazila deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

const select = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await upazilaService
      .findAll({ status: 'ACTIVE' })
      .select('name code _id');
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export default { findAll, create, findSingle, update, deleteItem, select };
