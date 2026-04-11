import { PipelineStage, Types } from 'mongoose';
import { IRoleFindAllParams, IRoleList } from './role.dto';
import Role from './role.model';

const findAll = ({ search, status, tenant_id }: IRoleFindAllParams) => {
  const query: any = { tenant_id };

  // search filter
  if (search) {
    query.$or = [{ name: { $regex: search, $options: 'i' } }];
  }
  if (status) {
    query.status = status;
  }
  return Role.find(query);
};

const findOne = (key: Partial<IRoleList>) => {
  return Role.findOne(key);
};

const create = ({ name, permissions, status, tenant_id }: IRoleList) => {
  const role = new Role({ name, permissions, status, tenant_id });
  return role.save();
};

const update = ({
  _id,
  data,
  tenant_id,
}: {
  _id: Types.ObjectId;
  data: Partial<IRoleList>;
  tenant_id: Types.ObjectId;
}) => {
  return Role.findOneAndUpdate({ _id, tenant_id }, data, { new: true });
};

const deleteItem = ({
  _id,
  tenant_id,
}: {
  _id: Types.ObjectId;
  tenant_id: Types.ObjectId;
}) => {
  return Role.findOneAndDelete(
    { _id, tenant_id },
    { returnDocument: 'after', runValidators: true },
  );
};

const count = ({ search, status, tenant_id }: IRoleFindAllParams) => {
  const query: any = { tenant_id };

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
