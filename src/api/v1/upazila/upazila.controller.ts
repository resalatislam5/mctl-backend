import { NextFunction, Request, Response } from 'express';
import { IParams } from '../../../types/commonTypes';
import { customError } from '../../../utils/customError';

import mongoose from 'mongoose';
import { checkMongooseId } from '../../../utils/checkMongooseId';
import { detectChanges } from '../../../utils/detectChanges';
import auditLogService from '../auditLog/auditLog.service';
import { IUpazilaList } from './upazila.dto';
import upazilaService from './upazila.service';

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

    // const data = await upazilaService.findOne({ key: { _id: _id as string } });
    const objId = new mongoose.Types.ObjectId(_id);
    const data = await upazilaService.aggregate([
      {
        $match: {
          _id: objId,
        },
      },
      {
        $lookup: {
          from: 'districts',
          localField: 'district_id',
          foreignField: '_id',
          as: 'district',
        },
      },
      {
        $unwind: {
          path: '$district',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          division_id: { $ifNull: ['$district.division_id', null] },
        },
      },
      {
        $lookup: {
          from: 'divisions',
          localField: 'division_id',
          foreignField: '_id',
          as: 'division',
        },
      },
      {
        $unwind: {
          path: '$division',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          country_id: {
            $ifNull: ['$division.country_id', null],
          },
        },
      },
      {
        $project: {
          division: 0,
          district: 0,
        },
      },
    ]);
    if (!data) {
      customError('Upazila not found', 404);
    }
    res.json({ success: true, data: data[0] });
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

    await auditLogService.create({
      req,
      user: req.user,
      action: 'CREATE',
      entity: 'Upazila',
      entity_id: data?._id,
      description: `A new upazila has been created upazila_id: ${data?._id.toString()}`,
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

const update = async (req: Request, res: Response, next: NextFunction) => {
  const { _id } = req.params;
  const { name, code, district_id, status } = req.body;
  try {
    checkMongooseId(_id as string);

    const findSingle = await upazilaService.findOne({
      key: { _id: _id as string },
    });
    if (!findSingle) {
      return customError('Upazila not found', 404);
    }

    const data = await upazilaService.update(_id as string, {
      name,
      code,
      district_id,
      status,
    });

    const compareChange = detectChanges(
      findSingle.toObject(),
      data?.toObject(),
    );

    await auditLogService.create({
      req,
      user: req.user,
      action: 'UPDATE',
      entity: 'Upazila',
      entity_id: findSingle._id,
      changes: compareChange,
      description: `A new upazila has been updated upazila_id: ${_id}`,
    });

    res.json({
      success: true,
      message: 'Upazila updated successfully',
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

    const findSingle = await upazilaService.findOne({
      key: { _id: _id as string },
    });
    if (!findSingle) {
      return customError('Upazila not found', 404);
    }

    await upazilaService.deleteItem(_id as string);

    await auditLogService.create({
      req,
      user: req.user,
      action: 'DELETE',
      entity: 'Upazila',
      entity_id: findSingle._id,
      changes: findSingle,
      description: `A new upazila has been deleted upazila_id: ${_id}`,
    });

    res.json({
      success: true,
      message: 'Upazila deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

const select = async (req: Request, res: Response, next: NextFunction) => {
  const district_id = req.query.district_id?.toString() || '';
  try {
    const data = await upazilaService
      .findAll({ status: 'ACTIVE', district_id })
      .select('name code _id');
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export default { findAll, create, findSingle, update, deleteItem, select };
