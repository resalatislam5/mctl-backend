import { UploadApiResponse } from 'cloudinary';
import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import streamifier from 'streamifier';
import cloudinary from '../../../config/cloudinary.config';
import { IParams } from '../../../types/commonTypes';
import { checkMongooseId } from '../../../utils/checkMongooseId';
import { customError } from '../../../utils/customError';
import { detectChanges } from '../../../utils/detectChanges';
import auditLogService from '../auditLog/auditLog.service';
import { IHeadList } from './head.dto';
import HeadService from './head.service';

const findAll = async (req: Request, res: Response, next: NextFunction) => {
  const search = req.query.search?.toString() || '';
  const limit = Number(req.query.limit || 100);
  const skip = Number(req.query.skip || 0);
  try {
    const [data, total] = await Promise.all([
      HeadService.findAll({ search })
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 })
        .select('name createdAt'),
      HeadService.count({ search }),
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

    const data = await HeadService.findOne({ key: { _id: _id as string } });

    if (!data) {
      customError('Head not found', 404);
    }
    res.json({ success: true, data: data });
  } catch (err) {
    next(err);
  }
};

const create = async (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.body as IHeadList;
  try {
    const data = await HeadService.create({
      name,
    });

    await auditLogService.create({
      req,
      user: req.user,
      action: 'CREATE',
      entity: 'Head',
      entity_id: data?._id?.toString() as string,
      description: `A new Head has been created head_id: ${data?._id?.toString()}`,
    });

    res.json({
      success: true,
      message: 'Head created successfully',
      data,
    });
  } catch (err) {
    next(err);
  }
};

const update = async (req: Request, res: Response, next: NextFunction) => {
  const { _id } = req.params;

  const { name } = (req?.body || {}) as IHeadList;

  try {
    checkMongooseId(_id as string);

    const findSingle = await HeadService.findOne({
      key: { _id: _id as string },
    });
    if (!findSingle) {
      return customError('Head not found', 404);
    }

    const data = await HeadService.update(_id as string, {
      name,
    });

    const compareChange = detectChanges(
      findSingle.toObject(),
      data?.toObject(),
    );

    await auditLogService.create({
      req,
      user: req.user,
      action: 'DELETE',
      entity: 'Head',
      entity_id: _id as string,
      changes: compareChange,
      description: `A new Head has been deleted head_id: ${_id}`,
    });

    res.json({
      success: true,
      message: 'Head updated successfully',
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

    const findSingle = await HeadService.findOne({
      key: { _id: _id as string },
    });
    if (!findSingle) {
      return customError('Head not found', 404);
    }

    await HeadService.deleteItem(_id as string);

    await auditLogService.create({
      req,
      user: req.user,
      action: 'DELETE',
      entity: 'Head',
      entity_id: _id as string,
      changes: findSingle,
      description: `A new Head has been deleted Head_id: ${_id}`,
    });

    res.json({
      success: true,
      message: 'Head deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

const select = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await HeadService.findAll({}).select('name _id');
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export default { findAll, create, findSingle, update, deleteItem, select };
