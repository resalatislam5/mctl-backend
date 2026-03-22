import { NextFunction, Request, Response } from 'express';
import { IParams } from '../../../types/commonTypes';
import { checkMongooseId } from '../../../utils/checkMongooseId';
import { customError } from '../../../utils/customError';

import { convertObjectID } from '../../../utils/ConvertObjectID';
import agentService from '../Agent/agent.service';
import auditLogService from '../auditLog/auditLog.service';
import enrollmentService from '../enrollment/enrollment.service';
import { IAgentCommissionList } from './agentCommission.dto';
import agentCommissionService from './agentCommission.service';

const findAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query: any = {};
    const batch_id = req.query?.batch_id?.toString() || '';
    const agent_id = req.query?.agent_id?.toString() || '';

    if (!agent_id && !batch_id) {
      customError('agent_id or batch_id are required', 404);
    }

    if (batch_id) {
      query.batch_id = convertObjectID(batch_id);
    }
    if (agent_id) {
      query.agent_id = convertObjectID(agent_id);
    }
    const data = await agentCommissionService.aggregate([
      {
        $match: query,
      },
      {
        $lookup: {
          from: 'agents',
          localField: 'agent_id',
          foreignField: '_id',
          as: 'agent',
        },
      },
      {
        $lookup: {
          from: 'batches',
          localField: 'batch_id',
          foreignField: '_id',
          as: 'batch',
        },
      },
      {
        $addFields: {
          agent_name: {
            $ifNull: [{ $arrayElemAt: ['$agent.name', 0] }, null],
          },
          batch_no: {
            $ifNull: [{ $arrayElemAt: ['$batch.batch_no', 0] }, null],
          },
        },
      },
      {
        $facet: {
          data: [
            {
              $project: {
                agent: 0,
                batch: 0,
              },
            },
          ],
          totalCount: [{ $count: 'count' }],
        },
      },
    ]);
    res.json({
      success: true,
      total: data[0]?.totalCount?.[0]?.count,
      data: data[0]?.data,
    });
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

    const data = await agentCommissionService.findOne({
      key: { _id: _id as string },
    });
    if (!data) {
      customError('Agent not found', 404);
    }
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const generate = async (req: Request, res: Response, next: NextFunction) => {
  const { batch_id } = req.body as IAgentCommissionList;

  try {
    const agents = await agentService.findAll({});
    for (const agent of agents) {
      const enrollments = await enrollmentService.findAll({
        agent_id: agent?._id,
        batch_id: convertObjectID(batch_id),
      });
      if (!enrollments.length) continue;

      const eligible = enrollments.filter((e) => {
        const percent =
          (Number(e.total_paid || 0) /
            (Number(e.total_amount || 0) - Number(e.meal_accommodation || 0))) *
          100;
        return percent >= Number(agent.min_limit || 0);
      });
      const total_students = enrollments.length;
      const eligible_students = eligible.length;

      const total_amount = enrollments.reduce(
        (sum, e) => Number(e.total_amount) - Number(e.meal_accommodation) + sum,
        0,
      );
      let commission_amount = 0;

      // if (eligible_students >= Number(agent?.min_limit || 0)) {
      //   commission_amount =
      //     total_amount * (Number(agent.commission || 0) / 100);
      // }

      if (total_students >= Number(agent?.min_limit || 0)) {
        const e_total_amount = eligible.reduce(
          (sum, e) =>
            Number(e.total_amount) - Number(e.meal_accommodation) + sum,
          0,
        );

        commission_amount =
          e_total_amount * (Number(agent.commission || 0) / 100);
      }

      const existing = await agentCommissionService.findOne({
        key: {
          agent_id: `${agent._id}`,
          batch_id,
        },
      });

      // 🔒 paid হলে skip
      // if (existing && existing.status === 'paid') {
      //   continue;
      // }

      if (!existing) {
        // 👉 CREATE
        await agentCommissionService.create({
          agent_id: `${agent._id}`,
          batch_id,
          total_students,
          eligible_students,
          total_amount: total_amount.toFixed(2),
          commission_rate: agent.commission,
          commission_amount: commission_amount.toFixed(2),
        });
      } else {
        // 👉 UPDATE

        await agentCommissionService.update(existing._id.toString(), {
          $set: {
            total_students,
            eligible_students,
            total_amount,
            commission_rate: agent.commission,
            commission_amount,
          },
        });
      }
    }

    await auditLogService.create({
      req,
      user: req.user,
      action: 'CREATE',
      entity: 'Agent',
      entity_id: batch_id as string,
      description: `A new batch commission has been generate batch_id: ${batch_id}`,
    });

    res.json({
      success: true,
      message: 'Agent Commission generate successfully',
    });
  } catch (err) {
    next(err);
  }
};

const select = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query: any = {};
    const agent_id = req.query?.agent_id?.toString() || '';

    if (agent_id) {
      query.agent_id = convertObjectID(agent_id);
    }
    const data = await agentCommissionService.aggregate([
      {
        $match: query,
      },

      {
        $lookup: {
          from: 'batches',
          localField: 'batch_id',
          foreignField: '_id',
          as: 'batch',
        },
      },
      {
        $addFields: {
          batch_no: {
            $ifNull: [{ $arrayElemAt: ['$batch.batch_no', 0] }, null],
          },
        },
      },
      {
        $project: {
          _id: 1,
          commission_amount: 1,
          paid_amount: 1,
          batch_no: 1,
        },
      },
    ]);
    res.json({
      success: true,
      data: data,
    });
  } catch (err) {
    next(err);
  }
};

export default { findAll, generate, findSingle, select };
