import mongoose, { PipelineStage, Types } from 'mongoose';
import { ICreateUser, IUserFindAllParams } from './user.dto';
import User from './user.model';

const findAll = ({
  search,
  status,
  is_owner,
  tenant_id,
}: IUserFindAllParams) => {
  const query: any = { tenant_id };

  // search filter
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  if (status) {
    query.status = status;
  }
  if (is_owner !== undefined) {
    query.is_owner = is_owner;
  }

  return User.find(query);
};

// const findOne = ({
//   _id,
//   email = '',
//   tenant_id,
// }: {
//   _id?: string;
//   email?: string;
//   tenant_id: string;
// }) => {
//   if (_id) {
//     return User.findById({_id, tenant_id});
//   }
//   return User.findOne({ email, tenant_id: tenant_id });
// };

const findOne = ({
  _id,
  email,
  tenant_id,
}: {
  _id?: string;
  email?: string;
  tenant_id: string;
}) => {
  const query: any = { tenant_id };

  if (_id) query._id = _id;
  if (email) query.email = email;

  return User.findOne(query);
};

const findWithoutTenantId = ({
  _id,
  email,
}: {
  _id?: Types.ObjectId | { $ne: Types.ObjectId };
  email?: string;
}) => {
  const query: any = {};

  if (_id) query._id = _id;
  if (email) query.email = email;

  return User.findOne(query);
};

const create = ({
  email,
  name,
  password,
  role_id,
  status,
  tenant_id,
}: ICreateUser) => {
  const user = new User({
    email,
    name,
    password,
    role_id: new mongoose.Types.ObjectId(role_id),
    status,
    tenant_id: new mongoose.Types.ObjectId(tenant_id),
  });

  return user.save();
};
const update = (
  _id: string,
  { email, name, password, role_id, status, tenant_id }: ICreateUser,
) => {
  return User.findOneAndUpdate(
    { _id, tenant_id },
    {
      email,
      name,
      password,
      role_id: new mongoose.Types.ObjectId(role_id),
      status,
      tenant_id: new mongoose.Types.ObjectId(tenant_id),
    },
    {
      new: true,
    },
  );
};

const deleteOne = (_id: string, tenant_id: string) => {
  return User.findOneAndDelete({ _id, tenant_id });
};

const count = ({ search, status, tenant_id }: IUserFindAllParams) => {
  const query: any = { tenant_id };

  // module_id filter
  if (status) {
    query.status = status;
  }
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  if (status) {
    query.status = status;
  }

  return User.countDocuments(query);
};

export const aggregate = (pipeline: PipelineStage[]) => {
  return User.aggregate(pipeline);
};

export default {
  findAll,
  create,
  deleteOne,
  findOne,
  update,
  count,
  aggregate,
  findWithoutTenantId,
};
