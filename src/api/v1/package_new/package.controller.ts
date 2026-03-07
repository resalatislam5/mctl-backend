import { aggregate } from '../user/user.service';
import { NextFunction, Request, Response } from 'express';
import { IParams } from '../../../types/commonTypes';
import { customError } from '../../../utils/customError';
import { checkMongooseId } from '../../../utils/checkMongooseId';
import packageService from './package.service';
import { IPackageList } from './package.dto';
import auditLogService from '../auditLog/auditLog.service';
import { detectChanges } from '../../../utils/detectChanges';
import mongoose, { Mongoose } from 'mongoose';

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

    const objId = new mongoose.Types.ObjectId(_id);
    const data = await packageService.aggregate([
      { $match: { _id: objId } },

      {
        $addFields: {
          course_ids: {
            $map: {
              input: '$course_ids',
              as: 'id',
              in: { $toObjectId: '$$id' },
            },
          },
        },
      },
      {
        $lookup: {
          from: 'courses',
          localField: 'course_ids',
          foreignField: '_id',
          as: 'courses',
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          course_ids: 1,
          total_price: 1,
          net_price: 1,
          discount: 1,
          additional_discount: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          courses: { _id: 1, name: 1 },
        },
      },
    ]);

    if (!data[0]) {
      customError('Package not found', 404);
    }
    res.json({ success: true, data: data[0] });
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

    await auditLogService.create({
      req,
      user: req.user,
      action: 'CREATE',
      entity: 'Package',
      entity_id: data?._id?.toString() as string,
      description: `A new package has been created package_id: ${data?._id?.toString()}`,
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

const update = async (req: Request, res: Response, next: NextFunction) => {
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
    checkMongooseId(_id as string);

    const findSingle = await packageService.findOne({
      key: { _id: _id as string },
    });
    if (!findSingle) {
      return customError('Package not found', 404);
    }
    const data = await packageService.update(_id as string, {
      name,
      total_price,
      net_price,
      discount,
      additional_discount,
      status,
    });

    const compareChange = detectChanges(
      findSingle.toObject(),
      data?.toObject(),
    );

    await auditLogService.create({
      req,
      user: req.user,
      action: 'DELETE',
      entity: 'Package',
      entity_id: _id as string,
      changes: compareChange,
      description: `A new package has been deleted package_id: ${_id}`,
    });

    res.json({
      success: true,
      message: 'Package updated successfully',
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

    const findSingle = await packageService.findOne({
      key: { _id: _id as string },
    });
    if (!findSingle) {
      return customError('Package not found', 404);
    }

    await packageService.deleteItem(_id as string);

    await auditLogService.create({
      req,
      user: req.user,
      action: 'DELETE',
      entity: 'Package',
      entity_id: _id as string,
      changes: findSingle,
      description: `A new package has been deleted package_id: ${_id}`,
    });

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
      .select('name net_price _id');
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export default { findAll, create, findSingle, update, deleteItem, select };
