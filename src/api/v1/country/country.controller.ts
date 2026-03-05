import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { customError } from '../../../utils/customError';
import countryService from './country.service';
import { IParams } from '../../../types/commonTypes';
import { checkMongooseId } from '../../../utils/checkMongooseId';
import auditLogService from '../auditLog/auditLog.service';
import { detectChanges } from '../../../utils/detectChanges';

const findAll = async (req: Request, res: Response, next: NextFunction) => {
  const search = req.query.search?.toString() || '';
  const limit = Number(req.query.limit || 100);
  const skip = Number(req.query.skip || 0);
  const status = req.query.status?.toString() as 'ACTIVE' | 'INACTIVE';

  try {
    const [data, total] = await Promise.all([
      countryService
        .findAll({ search, status })
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 }),
      countryService.count({ search, status }),
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

    const data = await countryService.findOne({ key: { _id: _id as string } });
    if (!data) {
      customError('Country not found', 404);
    }
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const create = async (req: Request, res: Response, next: NextFunction) => {
  const { name, code } = req.body;
  try {
    const data = await countryService.create({ name, code });

    await auditLogService.create({
      req,
      user: req.user,
      action: 'CREATE',
      entity: 'Country',
      entity_id: data?._id.toString() as string,
      description: `A new country has been created country_id: ${data?._id.toString()}`,
    });

    res.json({
      success: true,
      message: 'Country created successfully',
      data,
    });
  } catch (err) {
    next(err);
  }
};

const update = async (req: Request, res: Response, next: NextFunction) => {
  const { _id } = req.params;
  const { name, code, status } = req.body;
  try {
    checkMongooseId(_id as string);

    const findSingle = await countryService.findOne({
      key: { _id: _id as string },
    });
    if (!findSingle) {
      return customError('Country not found', 404);
    }

    const data = await countryService.update(_id as string, {
      name,
      code,
      status,
    });

    const compareChange = detectChanges(
      findSingle?.toObject(),
      data?.toObject(),
    );

    await auditLogService.create({
      req,
      user: req.user,
      action: 'UPDATE',
      entity: 'Country',
      entity_id: _id as string,
      changes: compareChange,
      description: `A new country has been updated country_id: ${_id}`,
    });

    res.json({
      success: true,
      message: 'Country updated successfully',
      data,
    });
  } catch (err) {
    next(err);
  }
};

const deleteItem = async (req: Request, res: Response, next: NextFunction) => {
  const { _id } = req.params;
  try {
    checkMongooseId(_id as string);

    const findSingle = await countryService.findOne({
      key: { _id: _id as string },
    });
    if (!findSingle) {
      return customError('Country not found', 404);
    }
    await countryService.deleteItem(_id as string);
    await auditLogService.create({
      req,
      user: req.user,
      action: 'DELETE',
      entity: 'Country',
      entity_id: _id as string,
      changes: findSingle,
      description: `A new country has been created country_id: ${_id}`,
    });

    res.json({
      success: true,
      message: 'Country deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

const select = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await countryService
      .findAll({ status: 'ACTIVE' })
      .select('name code _id');
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export default { findAll, create, findSingle, update, deleteItem, select };
