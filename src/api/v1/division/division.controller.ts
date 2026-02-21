import { NextFunction, Request, Response } from 'express';
import { IParams } from '../../../types/commonTypes';
import { customError } from '../../../utils/customError';
import { IDivisionList } from './division.dto';
import divisionService from './division.service';
import { checkMongooseId } from '../../../utils/checkMongooseId';

const findAll = async (req: Request, res: Response, next: NextFunction) => {
  const search = req.query.search?.toString() || '';
  const limit = Number(req.query.limit || 100);
  const skip = Number(req.query.skip || 0);
  const country_id = req.query.country_id?.toString() || '';
  const status = req.query.status?.toString() as 'ACTIVE' | 'INACTIVE';
  try {
    const [data, total] = await Promise.all([
      divisionService
        .findAll({ search, country_id, status })
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 }),
      divisionService.count({ search, country_id, status }),
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

    const data = await divisionService.findOne({ key: { _id: _id as string } });
    if (!data) {
      customError('Division not found', 404);
    }
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const create = async (req: Request, res: Response, next: NextFunction) => {
  const { name, code, country_id, status } = req.body as IDivisionList;
  try {
    const data = await divisionService.create({
      name,
      code,
      country_id,
      status,
    });

    res.json({
      success: true,
      message: 'Division created successfully',
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

    const data = await divisionService.update(_id as string, {
      name,
      code,
      status,
    });
    if (!data) customError('Division not found', 404);

    res.json({
      success: true,
      message: 'Division updated successfully',
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

    const item = await divisionService.findOne({ key: { _id: _id as string } });
    if (!item) {
      return customError('Division not found', 404);
    }

    await divisionService.deleteItem(_id as string);
    res.json({
      success: true,
      message: 'Division deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

const select = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await divisionService
      .findAll({ status: 'ACTIVE' })
      .select('name code _id');
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export default { findAll, create, findSingle, update, deleteItem, select };
