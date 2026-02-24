import { PipelineStage } from 'mongoose';
import { ICreateRole, IRoleFindAllParams, IRoleList } from './role.dto';
import Role from './role.model';

const findAll = ({ search, status }: IRoleFindAllParams) => {
  const query: any = {};

  // search filter
  if (search) {
    query.$or = [{ module_id: { $regex: search, $options: 'i' } }];
  }
  if (status) {
    query.status = status;
  }
  return Role.find(query);
};

const findOne = ({ key }: { key?: Partial<IRoleList> }) => {
  if (key?._id) {
    return Role.findById(key._id);
  }

  return Role.findOne(key);
};

const create = ({ name, permissions, status }: IRoleList) => {
  const role = new Role({ name, permissions, status });
  return role.save();
};

const update = (_id: string, data: Partial<IRoleList>) => {
  return Role.findByIdAndUpdate(_id, data, { new: true });
};

const deleteItem = (_id: string) => {
  return Role.findByIdAndDelete(_id);
};

const count = ({ search, status }: IRoleFindAllParams) => {
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

  return Role.countDocuments(query);
};

const aggregate = (pipeline: PipelineStage[]) => {
  return Role.aggregate(pipeline);
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
