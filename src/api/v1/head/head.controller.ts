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
import { convertObjectID } from '../../../utils/ConvertObjectID';

const findAll = async (req: Request, res: Response, next: NextFunction) => {
  const search = req.query.search?.toString() || '';
  const limit = Number(req.query.limit || 100);
  const skip = Number(req.query.skip || 0);
  try {
    const [data, total] = await Promise.all([
      HeadService.findAll({ search, tenant_id: req.user?.tenant_id })
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 })
        .select('name createdAt'),
      HeadService.count({ search, tenant_id: req.user?.tenant_id }),
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

    const data = await HeadService.findOne({
      _id: convertObjectID(_id),
      tenant_id: req.user?.tenant_id,
    });

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
      tenant_id: req.user.tenant_id,
    });

    await auditLogService.create({
      req,
      user: req.user,
      action: 'CREATE',
      entity: 'Head',
      entity_id: data?._id,
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
      _id: convertObjectID(_id as string),
      tenant_id: req.user.tenant_id,
    });
    if (!findSingle) {
      return customError('Head not found', 404);
    }

    const data = await HeadService.update({
      _id: convertObjectID(_id as string),
      tenant_id: req.user.tenant_id,
      data: {
        name,
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
      entity: 'Head',
      entity_id: findSingle._id,
      changes: compareChange,
      description: `A new Head has been updated head_id: ${_id}`,
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
      _id: convertObjectID(_id as string),
      tenant_id: req.user.tenant_id,
    });
    if (!findSingle) {
      return customError('Head not found', 404);
    }

    await HeadService.deleteItem({
      _id: convertObjectID(_id as string),
      tenant_id: req.user.tenant_id,
    });

    await auditLogService.create({
      req,
      user: req.user,
      action: 'DELETE',
      entity: 'Head',
      entity_id: findSingle._id,
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
    const data = await HeadService.findAll({
      tenant_id: req.user.tenant_id,
    }).select('name _id');
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export default { findAll, create, findSingle, update, deleteItem, select };
