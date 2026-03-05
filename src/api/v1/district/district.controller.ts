import { NextFunction, Request, Response } from 'express';
import { IParams } from '../../../types/commonTypes';
import { checkMongooseId } from '../../../utils/checkMongooseId';
import { customError } from '../../../utils/customError';
import { IDistrictList } from './district.dto';
import districtService from './district.service';
import mongoose from 'mongoose';
import auditLogService from '../auditLog/auditLog.service';
import { detectChanges } from '../../../utils/detectChanges';

const findAll = async (req: Request, res: Response, next: NextFunction) => {
  const search = req.query.search?.toString() || '';
  const limit = Number(req.query.limit || 100);
  const skip = Number(req.query.skip || 0);
  const division_id = req.query.division_id?.toString() || '';
  const status = (req.query.status?.toString() as 'ACTIVE' | 'INACTIVE') || '';

  try {
    const [data, total] = await Promise.all([
      districtService
        .findAll({ search, division_id, status })
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 }),

      districtService.count({ search, division_id, status }),
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
    const data = await districtService.aggregate([
      { $match: { _id: objId } },

      {
        $lookup: {
          from: 'divisions',
          localField: 'division_id',
          foreignField: '_id',
          as: 'division',
        },
      },
      {
        $unwind: '$division',
      },
      {
        $addFields: {
          country_id: '$division.country_id',
        },
      },
      {
        $project: {
          division: 0,
        },
      },
    ]);
    if (!data) {
      customError('District not found', 404);
    }
    res.json({ success: true, data: data[0] });
  } catch (err) {
    next(err);
  }
};

const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, code, division_id, status } = req.body as IDistrictList;

    const data = await districtService.create({
      name,
      code,
      division_id,
      status,
    });

    await auditLogService.create({
      req,
      user: req.user,
      action: 'CREATE',
      entity: 'District',
      entity_id: data?._id.toString() as string,
      description: `A new district has been created district_id: ${data?._id.toString()}`,
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

const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { _id } = req.params;
    const { name, code, division_id, status } = req.body;
    checkMongooseId(_id as string);

    const findSingle = await districtService.findOne({
      key: { _id: _id as string },
    });
    if (!findSingle) {
      return customError('District not found', 404);
    }

    const data = await districtService.update(_id as string, {
      name,
      code,
      division_id,
      status,
    });

    const compareChange = detectChanges(
      findSingle.toObject(),
      data?.toObject(),
    );
    await auditLogService.create({
      req,
      user: req.user,
      action: 'CREATE',
      entity: 'District',
      entity_id: _id as string,
      changes: compareChange,
      description: `A new district has been updated district_id: ${_id}`,
    });

    res.json({
      success: true,
      message: 'District updated successfully',
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

    const findSingle = await districtService.findOne({
      key: { _id: _id as string },
    });
    if (!findSingle) {
      return customError('District not found', 404);
    }
    await districtService.deleteItem(_id as string);

    await auditLogService.create({
      req,
      user: req.user,
      action: 'DELETE',
      entity: 'District',
      entity_id: _id as string,
      changes: findSingle,
      description: `A new district has been deleted district_id: ${_id}`,
    });

    res.json({
      success: true,
      message: 'District deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

const select = async (req: Request, res: Response, next: NextFunction) => {
  const division_id = req.query.division_id as string;
  try {
    const data = await districtService
      .findAll({ status: 'ACTIVE', division_id })
      .select('name code _id');
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export default { findAll, create, findSingle, update, deleteItem, select };
