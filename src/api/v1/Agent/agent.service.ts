import { customError } from '../../../utils/customError';
import User from '../user/user.model';
import { IAgentFindAllParams, IAgentList } from './agent.dto';
import Agent from './agent.model';

const findAll = ({ search, status }: IAgentFindAllParams) => {
  const query: any = {};

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

const findOne = ({ key }: { key?: Partial<IAgentList> }) => {
  if (key?._id) {
    return Agent.findById(key._id);
  }

  return Agent.findOne(key);
};

const create = ({
  name,
  email,
  mobile_no,
  min_limit,
  commission,
  total_amount,
  paid_amount,
  status,
}: IAgentList) => {
  const oldAgent = User.findOne({ email });
  if (!oldAgent) customError('Agent with this email already exists', 400);

  const agent = new Agent({
    name,
    email,
    mobile_no,
    min_limit,
    commission,
    total_amount,
    paid_amount,
    status,
  });
  return agent.save();
};

const update = (_id: string, data: Partial<IAgentList>) => {
  return Agent.findByIdAndUpdate(_id, data, { new: true });
};

const deleteItem = (_id: string) => {
  return Agent.findByIdAndDelete(_id);
};

const count = ({ search, status }: IAgentFindAllParams) => {
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

  return Agent.countDocuments(query);
};

export default { findAll, findOne, create, update, deleteItem, count };
