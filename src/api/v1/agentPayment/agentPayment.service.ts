import { ClientSession, PipelineStage, Types } from 'mongoose';
import {
  IAgentPaymentFindAllParams,
  IAgentPaymentList,
} from './agentPayment.dto';
import AgentPayment from './agentPayment.model';

const findAll = ({
  search,
  agent_id,
  tenant_id,
}: IAgentPaymentFindAllParams) => {
  const query: Record<string, unknown> = { tenant_id };

  // search filter
  if (search) {
    query.$or = [{ name: { $regex: search, $options: 'i' } }];
  }
  if (agent_id) {
    query.agent_id = agent_id;
  }
  return AgentPayment.find(query);
};

const findOne = (key: Partial<IAgentPaymentList>) => {
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
    tenant_id,
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
    tenant_id,
  });
  return data.save({ ...(session && { session }) });
};

const update = ({
  _id,
  data,
  tenant_id,
  session,
}: {
  _id: Types.ObjectId;
  data: Partial<IAgentPaymentList>;
  session?: ClientSession | null;
  tenant_id: Types.ObjectId;
}) => {
  return AgentPayment.findOneAndUpdate({ _id, tenant_id }, data, {
    returnDocument: 'after',
    runValidators: true,
    ...(session && { session }),
  });
};

const deleteItem = ({
  _id,
  tenant_id,
}: {
  _id: Types.ObjectId;
  tenant_id: Types.ObjectId;
}) => {
  return AgentPayment.findOneAndDelete({ _id, tenant_id });
};

const count = ({ search, tenant_id }: IAgentPaymentFindAllParams) => {
  const query: Record<string, unknown> = { tenant_id };

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
