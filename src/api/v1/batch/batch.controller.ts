import { NextFunction, Request, Response } from 'express';
import { IParams } from '../../../types/commonTypes';
import { customError } from '../../../utils/customError';

import { checkMongooseId } from '../../../utils/checkMongooseId';
import batchService from './batch.service';
import { IBatchList } from './batch.dto';

const findAll = async (req: Request, res: Response, next: NextFunction) => {
  const search = req.query.search?.toString() || '';
  const limit = Number(req.query.limit || 100);
  const skip = Number(req.query.skip || 0);
  const status = req.query.status?.toString() as 'ACTIVE' | 'INACTIVE';
  try {
    const [data, total] = await Promise.all([
      batchService
        .findAll({ search, status })
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 }),
      batchService.count({ search, status }),
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

    const data = await batchService.findOne({ key: { _id: _id as string } });
    if (!data) {
      customError('Batch not found', 404);
    }
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const create = async (req: Request, res: Response, next: NextFunction) => {
  const { batch_no, status } = req.body as IBatchList;
  try {
    const data = await batchService.create({
      batch_no,
      status,
    });

    res.json({
      success: true,
      message: 'Batch created successfully',
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
  const { batch_no, status } = req.body as IBatchList;
  try {
    checkMongooseId(_id);

    const data = await batchService.update(_id as string, {
      batch_no,
      status,
    });
    if (!data) customError('Batch not found', 404);

    res.json({
      success: true,
      message: 'Batch updated successfully',
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

    const item = await batchService.findOne({ key: { _id: _id as string } });
    if (!item) {
      return customError('Batch not found', 404);
    }

    await batchService.deleteItem(_id as string);
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
    const data = await batchService
      .findAll({ status: 'ACTIVE' })
      .select('batch_no _id');
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export default { findAll, create, findSingle, update, deleteItem, select };
