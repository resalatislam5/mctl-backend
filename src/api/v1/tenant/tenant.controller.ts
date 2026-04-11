import { NextFunction, Request, Response } from 'express';
import { IParams } from '../../../types/commonTypes';
import { customError } from '../../../utils/customError';

import { checkMongooseId } from '../../../utils/checkMongooseId';

import auditLogService from '../auditLog/auditLog.service';
import { detectChanges } from '../../../utils/detectChanges';
import tenantService from './tenant.service';
import { convertObjectID } from '../../../utils/ConvertObjectID';
import { ICreateTenant, ITenantList } from './tenant.dto';

const findAll = async (req: Request, res: Response, next: NextFunction) => {
  const search = req.query.search?.toString() || '';
  const limit = Number(req.query.limit || 100);
  const skip = Number(req.query.skip || 0);
  const status = req.query.status?.toString() as 'ACTIVE' | 'INACTIVE';
  try {
    const [data, total] = await Promise.all([
      tenantService
        .findAll({ search, status })
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 }),
      tenantService.count({ search, status }),
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

    const data = await tenantService.findOne({
      key: { _id: convertObjectID(_id) },
    });
    if (!data) {
      customError('Tenant not found', 404);
    }
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const create = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, status } = req.body as ICreateTenant;
  try {
    const data = await tenantService.create({
      name,
      email,
      status,
    });

    // await auditLogService.create({
    //   req,
    //   user: req.user,
    //   action: 'CREATE',
    //   entity: 'Batch',
    //   entity_id: data?._id,
    //   description: `A new batch has been created batch_id: ${data?._id?.toString()}`,
    // });

    res.json({
      success: true,
      message: 'Tenant created successfully',
      data,
    });
  } catch (err) {
    next(err);
  }
};

const update = async (req: Request, res: Response, next: NextFunction) => {
  const { _id } = req.params;
  const { name, email, status } = req.body as ICreateTenant;
  try {
    checkMongooseId(_id as string);
    const findSingle = await tenantService.findOne({
      key: { _id: convertObjectID(_id as string) },
    });
    if (!findSingle) {
      return customError('Tenant not found', 404);
    }

    const data = await tenantService.update(_id as string, {
      name,
      email,
      status,
    });

    const compareChange = detectChanges(
      findSingle.toObject(),
      data?.toObject(),
    );
    // await auditLogService.create({
    //   req,
    //   user: req.user,
    //   action: 'UPDATE',
    //   entity: 'Batch',
    //   entity_id: findSingle._id,
    //   changes: compareChange,
    //   description: `A new batch has been updated batch_id: ${_id}`,
    // });

    res.json({
      success: true,
      message: 'Tenant updated successfully',
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

    const findSingle = await tenantService.findOne({
      key: { _id: convertObjectID(_id as string) },
    });
    if (!findSingle) {
      return customError('Tenant not found', 404);
    }

    await tenantService.deleteItem(_id as string);

    // await auditLogService.create({
    //   req,
    //   user: req.user,
    //   action: 'DELETE',
    //   entity: 'Batch',
    //   entity_id: findSingle._id,
    //   changes: findSingle,
    //   description: `A new batch has been deleted batch_id: ${_id}`,
    // });
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
    const data = await tenantService
      .findAll({ status: 'ACTIVE' })
      .select('batch_no _id');
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export default { findAll, create, findSingle, update, deleteItem, select };
