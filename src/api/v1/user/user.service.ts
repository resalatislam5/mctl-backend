import mongoose from 'mongoose';
import { ICreateUser, IUserFindAllParams } from './user.dto';
import User from './user.model';

const findAll = ({ search, status }: IUserFindAllParams) => {
  const query: any = {};

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
  return User.find(query);
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

const count = ({ search, status }: IUserFindAllParams) => {
  const query: any = {};

  // module_id filter
  if (status) {
    query.status = status;
  }
  // search filter
  if (search) {
    query.$or = [{ module_id: { $regex: search, $options: 'i' } }];
  }

  if (status) {
    query.status = status;
  }

  return User.countDocuments(query);
};

export default {
  findAll,
  create,
  deleteOne,
  findOne,
  update,
  count,
};
