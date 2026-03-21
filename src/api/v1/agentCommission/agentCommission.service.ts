import { ClientSession, PipelineStage, UpdateQuery } from 'mongoose';
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
}: IAgentCommissionFindAllParams) => {
  const query: any = {};
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

const findOne = ({ key }: { key?: Partial<IAgentCommissionList> }) => {
  if (key?._id) {
    return AgentCommission.findById(key._id);
  }

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

    status,
  });
  return data.save();
};

const update = (
  _id: string,
  data: UpdateQuery<IAgentCommissionList>,
  session?: ClientSession | null,
) => {
  return AgentCommission.findByIdAndUpdate(_id, data, {
    returnDocument: 'after',
    runValidators: true,
    ...(session && { session }),
  });
};

const count = ({ search, status }: IAgentCommissionFindAllParams) => {
  const query: any = {};

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
