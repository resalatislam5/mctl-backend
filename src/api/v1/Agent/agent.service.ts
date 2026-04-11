import { ClientSession, Types } from 'mongoose';
import { customError } from '../../../utils/customError';
import { IAgentFindAllParams, IAgentList } from './agent.dto';
import Agent from './agent.model';

const findAll = ({ search, status, tenant_id }: IAgentFindAllParams) => {
  const query: any = { tenant_id };

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
  return Agent.find(query);
};

const findOne = (key: Partial<IAgentList>) => {
  return Agent.findOne(key);
};

const create = async ({
  name,
  email,
  mobile_no,
  min_limit,
  commission,
  min_payment_percent,
  status,
  tenant_id,
}: IAgentList) => {
  const oldAgent = await Agent.findOne({ email, tenant_id });
  if (oldAgent) customError('Agent with this email already exists', 400);

  const agent = new Agent({
    name,
    email,
    mobile_no,
    min_limit,
    commission,
    min_payment_percent,
    status,
    tenant_id,
  });
  return agent.save();
};

const update = async ({
  _id,
  data,
  session,
  tenant_id,
}: {
  _id: Types.ObjectId;
  data: Partial<IAgentList>;
  session?: ClientSession | null;
  tenant_id: Types.ObjectId;
}) => {
  const oldAgent = await Agent.findOne({
    email: data.email || '',
    _id: { $ne: _id },
    tenant_id,
  });

  if (!!oldAgent) customError('Agent with this email already exists', 400);

  return Agent.findOneAndUpdate({ _id, tenant_id }, data, {
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
  return Agent.findOneAndDelete({ _id, tenant_id });
};

const count = ({ search, status, tenant_id }: IAgentFindAllParams) => {
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

  return Agent.countDocuments(query);
};

export default { findAll, findOne, create, update, deleteItem, count };
