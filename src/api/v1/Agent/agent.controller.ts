import { NextFunction, Request, Response } from 'express';
import { IParams } from '../../../types/commonTypes';
import { customError } from '../../../utils/customError';
import { checkMongooseId } from '../../../utils/checkMongooseId';
import agentService from './agent.service';
import { IAgentList } from './agent.dto';
import auditLogService from '../auditLog/auditLog.service';
import { detectChanges } from '../../../utils/detectChanges';
import { convertObjectID } from '../../../utils/ConvertObjectID';

const findAll = async (req: Request, res: Response, next: NextFunction) => {
  const search = req.query.search?.toString() || '';
  const limit = Number(req.query.limit || 100);
  const skip = Number(req.query.skip || 0);
  const status = req.query.status?.toString() as 'ACTIVE' | 'INACTIVE';
  try {
    const [data, total] = await Promise.all([
      agentService
        .findAll({ search, status, tenant_id: req.user?.tenant_id })
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 }),
      agentService.count({ search, status, tenant_id: req.user?.tenant_id }),
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

    const data = await agentService.findOne({
      _id: convertObjectID(_id),
      tenant_id: req.user?.tenant_id,
    });
    if (!data) {
      customError('Agent not found', 404);
    }
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const create = async (req: Request, res: Response, next: NextFunction) => {
  const {
    name,
    email,
    mobile_no,
    min_limit,
    commission,
    min_payment_percent,
    status,
  } = req.body as IAgentList;
  try {
    const data = await agentService.create({
      name,
      email,
      mobile_no,
      min_limit,
      commission,
      min_payment_percent,
      status,
      tenant_id: req.user?.tenant_id,
    });

    await auditLogService.create({
      req,
      user: req.user,
      action: 'CREATE',
      entity: 'Agent',
      entity_id: data?._id,
      description: `A new agent has been created agent_id: ${data?._id?.toString()}`,
    });

    res.json({
      success: true,
      message: 'Agent created successfully',
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
    email,
    mobile_no,
    min_limit,
    commission,
    min_payment_percent,
    status,
  } = req.body as IAgentList;
  try {
    checkMongooseId(_id as string);

    const findSingle = await agentService.findOne({
      _id: convertObjectID(_id as string),
      tenant_id: req.user?.tenant_id,
    });

    if (!findSingle) {
      return customError('Agent not found', 404);
    }

    const data = await agentService.update({
      _id: convertObjectID(_id as string),
      tenant_id: req.user?.tenant_id,
      data: {
        name,
        email,
        mobile_no,
        min_limit,
        commission,
        min_payment_percent,
        status,
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
      entity: 'Agent',
      entity_id: findSingle?._id,
      changes: compareChange,
      description: `A new agent has been updated agent_id: ${_id}`,
    });

    res.json({
      success: true,
      message: 'Agent updated successfully',
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

    const findSingle = await agentService.findOne({
      _id: convertObjectID(_id as string),
      tenant_id: req.user?.tenant_id,
    });
    if (!findSingle) {
      return customError('Agent not found', 404);
    }

    await agentService.deleteItem({
      _id: convertObjectID(_id as string),
      tenant_id: req.user?.tenant_id,
    });

    await auditLogService.create({
      req,
      user: req.user,
      action: 'DELETE',
      entity: 'Agent',
      entity_id: findSingle._id,
      changes: findSingle,
      description: `A new agent has been deleted agent_id: ${_id}`,
    });

    res.json({
      success: true,
      message: 'Agent deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

const select = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await agentService
      .findAll({ status: 'ACTIVE', tenant_id: req.user?.tenant_id })
      .select('name email _id');
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export default { findAll, create, findSingle, update, deleteItem, select };
