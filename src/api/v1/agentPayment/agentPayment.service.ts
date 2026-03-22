import { ClientSession, PipelineStage } from 'mongoose';
import {
  IAgentPaymentFindAllParams,
  IAgentPaymentList,
} from './agentPayment.dto';
import AgentPayment from './agentPayment.model';

const findAll = ({ search, agent_id }: IAgentPaymentFindAllParams) => {
  const query: Record<string, unknown> = {};

  // search filter
  if (search) {
    query.$or = [{ name: { $regex: search, $options: 'i' } }];
  }
  if (agent_id) {
    query.agent_id = agent_id;
  }
  return AgentPayment.find(query);
};

const findOne = ({ key }: { key?: Partial<IAgentPaymentList> }) => {
  if (key?._id) {
    return AgentPayment.findById(key._id);
  }

  return AgentPayment.findOne(key);
};

const create = (
  {
    acc_id,
    amount,
    paid_amount,
    payment_method,
    voucher_no,
    date,
    agent_id,
    commission_id,
    note,
    reference_no,
  }: IAgentPaymentList,
  session?: ClientSession | null,
) => {
  const data = new AgentPayment({
    acc_id,
    amount,
    paid_amount,
    payment_method,
    voucher_no,
    date,
    agent_id,
    commission_id,
    note,
    reference_no,
  });
  return data.save({ ...(session && { session }) });
};

const update = (
  _id: string,
  data: Partial<IAgentPaymentList>,
  session?: ClientSession | null,
) => {
  return AgentPayment.findByIdAndUpdate(_id, data, {
    returnDocument: 'after',
    runValidators: true,
    ...(session && { session }),
  });
};

const deleteItem = (_id: string) => {
  return AgentPayment.findByIdAndDelete(_id);
};

const count = ({ search }: IAgentPaymentFindAllParams) => {
  const query: Record<string, unknown> = {};

  // search filter
  if (search) {
    query.$or = [{ name: { $regex: search, $options: 'i' } }];
  }

  return AgentPayment.countDocuments(query);
};

const aggregate = (pipeline: PipelineStage[]) => {
  return AgentPayment.aggregate(pipeline);
};

export default {
  findAll,
  findOne,
  create,
  update,
  deleteItem,
  count,
  aggregate,
};
