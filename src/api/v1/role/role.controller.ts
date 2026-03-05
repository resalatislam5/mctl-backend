import { NextFunction, Request, Response } from 'express';
import { IParams } from '../../../types/commonTypes';
import { customError } from '../../../utils/customError';
import { checkMongooseId } from '../../../utils/checkMongooseId';
import roleService from './role.service';
import { IRoleList } from './role.dto';
import mongoose from 'mongoose';
import auditLogService from '../auditLog/auditLog.service';

const findAll = async (req: Request, res: Response, next: NextFunction) => {
  const search = req.query.search?.toString() || '';
  const limit = Number(req.query.limit || 100);
  const skip = Number(req.query.skip || 0);
  const status = req.query.status?.toString() as 'ACTIVE' | 'INACTIVE';
  try {
    const [data, total] = await Promise.all([
      roleService
        .findAll({ search, status })
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 })
        .select('_id name status createdAt updatedAt'),
      roleService.count({ search, status }),
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

    // const data = await roleService.findOne({ key: { _id: _id as string } });
    // if (!data) {
    //   customError('Batch not found', 404);
    // }
    const data = await roleService.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(_id),
        },
      },

      {
        $unwind: {
          path: '$permissions',
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $lookup: {
          from: 'modules',
          localField: 'permissions.module_id',
          foreignField: '_id',
          as: 'module',
        },
      },
      {
        $unwind: {
          path: '$module',
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $addFields: {
          'permissions.module_name': '$module.name',
          'permissions.module_lable': '$module.lable',
        },
      },

      // 6️⃣ regroup role
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          permissions: { $push: '$permissions' },
          createdAt: { $first: '$createdAt' },
          updatedAt: { $first: '$updatedAt' },
        },
      },
    ]);

    res.json({ success: true, data: data[0] });
  } catch (err) {
    next(err);
  }
};

const create = async (req: Request, res: Response, next: NextFunction) => {
  const { name, permissions, status } = req.body as IRoleList;
  try {
    const data = await roleService.create({
      name,
      permissions,
      status,
    });

    await auditLogService.create({
      req,
      user: req.user,
      action: 'CREATE',
      entity: 'Role',
      entity_id: data?._id.toString(),
      changes: data,
      description: `A new role has been created role_id: ${data?._id}`,
    });

    res.json({
      success: true,
      message: 'Role created successfully',
      data,
    });
  } catch (err) {
    next(err);
  }
};

const update = async (req: Request, res: Response, next: NextFunction) => {
  const { _id } = req.params;
  const { name, permissions, status } = req.body as IRoleList;
  try {
    checkMongooseId(_id as string);
    const findSingle = roleService.findOne({ _id: _id as string });
    if (!findSingle) customError('Role not found', 404);
    const data = await roleService.update(_id as string, {
      name,
      permissions,
      status,
    });

    await auditLogService.create({
      req,
      user: req.user,
      action: 'UPDATE',
      entity: 'Role',
      entity_id: _id as string,
      changes: data,
      description: `A new role has been updated role_id: ${_id}`,
    });

    res.json({
      success: true,
      message: 'Role updated successfully',
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

    const findSingle = await roleService.findOne({ _id: _id as string });
    if (!findSingle) {
      return customError('Batch not found', 404);
    }

    await roleService.deleteItem(_id as string);

    await auditLogService.create({
      req,
      user: req.user,
      action: 'DELETE',
      entity: 'Role',
      entity_id: _id as string,
      changes: findSingle,
      description: `A new role has been deleted role_id: ${_id}`,
    });

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
    const data = await roleService
      .findAll({ status: 'ACTIVE' })
      .select('name _id');
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export default { findAll, create, findSingle, update, deleteItem, select };
