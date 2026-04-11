import { ClientSession, PipelineStage, Types, UpdateQuery } from 'mongoose';
import {
  IAgentCommissionFindAllParams,
  IAgentCommissionList,
} from './agentCommission.dto';
import AgentCommission from './agentCommission.model';
import { customError } from '../../../utils/customError';

const findAll = ({
  search,
  status,
  agent_id,
  batch_id,
  tenant_id,
}: IAgentCommissionFindAllParams) => {
  const query: any = { tenant_id };
  if (agent_id) {
    query.agent_id = agent_id;
  }
  if (batch_id) {
    query.batch_id = batch_id;
  }

  if (search) {
    // query.$or = [
    //   { name: { $regex: search, $options: 'i' } },
    //   { email: { $regex: search, $options: 'i' } },
    //   { mobile_no: { $regex: search, $options: 'i' } },
    // ];
  }

  if (status) {
    query.status = status;
  }
  return AgentCommission.find(query);
};

const findOne = (key: Partial<IAgentCommissionList>) => {
  return AgentCommission.findOne(key);
};

const create = ({
  agent_id,
  batch_id,
  commission_amount,
  commission_rate,
  eligible_students,
  paid_amount,
  total_amount,
  total_students,
  status,
  tenant_id,
}: IAgentCommissionList) => {
  const data = new AgentCommission({
    agent_id,
    batch_id,
    commission_amount,
    commission_rate,
    eligible_students,
    paid_amount,
    total_amount,
    total_students,
    tenant_id,
    status,
  });
  return data.save();
};

const update = ({
  _id,
  data,
  session,
  tenant_id,
}: {
  _id: Types.ObjectId;
  data: UpdateQuery<IAgentCommissionList>;
  session?: ClientSession | null;
  tenant_id: Types.ObjectId;
}) => {
  return AgentCommission.findOneAndUpdate({ _id, tenant_id }, data, {
    returnDocument: 'after',
    runValidators: true,
    ...(session && { session }),
  });
};

const count = ({
  search,
  status,
  tenant_id,
}: IAgentCommissionFindAllParams) => {
  const query: any = { tenant_id };

  // name filter
  if (status) {
    query.status = status;
  }
  // search filter
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { mobile_no: { $regex: search, $options: 'i' } },
    ];
  }

  if (status) {
    query.status = status;
  }

  return AgentCommission.countDocuments(query);
};

const aggregate = (pipeline: PipelineStage[]) => {
  return AgentCommission.aggregate(pipeline);
};

export default { findAll, findOne, create, count, update, aggregate };
