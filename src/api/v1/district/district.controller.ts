import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { customError } from '../../../utils/customError';
import districtService from './district.service';
import { IDistrictList } from './district.dto';
import { IParams } from '../../../types/commonTypes';
import { checkMongooseId } from '../../../utils/checkMongooseId';

const findAll = async (req: Request, res: Response, next: NextFunction) => {
  const search = req.query.search?.toString() || '';
  const limit = Number(req.query.limit || 100);
  const skip = Number(req.query.skip || 0);
  const country_id = req.query.country_id?.toString() || '';
  const division_id = req.query.division_id?.toString() || '';

  try {
    const [data, total] = await Promise.all([
      districtService
        .findAll({ search, country_id, division_id })
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 }),

      districtService.count({ search, country_id, division_id }),
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

    const data = await districtService.findOne({ key: { _id: _id as string } });
    if (!data) {
      customError('District not found', 404);
    }
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, code, division_id, status } = req.body as IDistrictList;
    console.log(req.body);

    const data = await districtService.create({
      name,
      code,
      division_id,
      status,
    });

    res.json({
      success: true,
      message: 'District created successfully',
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
  try {
    const { _id } = req.params;
    const { name, code, status } = req.body;
    checkMongooseId(_id);

    const data = await districtService.update(_id as string, {
      name,
      code,
      status,
    });
    if (!data) customError('District not found', 404);

    res.json({
      success: true,
      message: 'District updated successfully',
      data,
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

    const item = await districtService.findOne({ key: { _id: _id as string } });
    if (!item) {
      return customError('District not found', 404);
    }
    await districtService.deleteItem(_id as string);
    res.json({
      success: true,
      message: 'District deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

const select = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await districtService.findAll({}).select('name code _id');
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export default { findAll, create, findSingle, update, deleteItem, select };
