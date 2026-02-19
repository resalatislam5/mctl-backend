import mongoose from 'mongoose';
import { paginationQueryTypes } from '../../../types/commonTypes';
import { paginate } from '../../../utils/pagination';
import { ICreateUser, userQuery } from './user.dto';
import User, { IUser } from './user.model';

const findAllWithPagination = ({
  filter,
  query,
  options,
}: {
  filter: userQuery;
  query: paginationQueryTypes;
  options: object;
}) => {
  return paginate(User, filter, query, options);
};
const findAll = () => {
  return User.find();
};

const findOne = ({ _id, email = '' }: { _id?: string; email?: string }) => {
  if (_id) {
    return User.findById(_id);
  }
  return User.findOne({ email });
};
const create = ({ email, name, password, role_id, status }: ICreateUser) => {
  const user = new User({
    email,
    name,
    password,
    role_id: new mongoose.Types.ObjectId(role_id),
    status,
  });

  return user.save();
};
const update = (
  _id: string,
  { email, name, password, role_id, status }: ICreateUser,
) => {
  return User.updateOne(
    { _id },
    {
      email,
      name,
      password,
      role_id: new mongoose.Types.ObjectId(role_id),
      status,
    },
  );
};
const deleteOne = (_id: string) => {
  return User.findByIdAndDelete(_id);
};

export default {
  findAll,
  create,
  deleteOne,
  findOne,
  update,
  findAllWithPagination,
};
