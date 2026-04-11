import { PipelineStage, Types } from 'mongoose';
import { IPackageFindAllParams, IPackageList } from './package.dto';
import Package from './package.model';

const findAll = ({ search, status, tenant_id }: IPackageFindAllParams) => {
  const query: any = { tenant_id };

  if (search) {
    query.$or = [{ name: { $regex: search, $options: 'i' } }];
  }

  if (status) {
    query.status = status;
  }
  return Package.find(query);
};

const findOne = (key: Partial<IPackageList>) => {
  return Package.findOne(key);
};

const create = ({
  name,
  course_ids,
  total_price,
  net_price,
  discount,
  additional_discount,
  status,
  tenant_id,
}: IPackageList) => {
  const data = new Package({
    name,
    course_ids,
    total_price,
    net_price,
    discount,
    additional_discount,
    status,
    tenant_id,
  });
  return data.save();
};

const update = ({
  _id,
  data,
  tenant_id,
}: {
  _id: Types.ObjectId;
  data: Partial<IPackageList>;
  tenant_id: Types.ObjectId;
}) => {
  return Package.findOneAndUpdate({ _id, tenant_id }, data, {
    returnDocument: 'after',
    runValidators: true,
  });
};

const deleteItem = ({
  _id,
  tenant_id,
}: {
  _id: Types.ObjectId;
  tenant_id: Types.ObjectId;
}) => {
  return Package.findByIdAndDelete({ _id, tenant_id });
};

const count = ({ search, status, tenant_id }: IPackageFindAllParams) => {
  const query: any = { tenant_id };

  // name filter
  if (status) {
    query.status = status;
  }
  // search filter
  if (search) {
    query.$or = [{ name: { $regex: search, $options: 'i' } }];
  }

  if (status) {
    query.status = status;
  }

  return Package.countDocuments(query);
};

const aggregate = (pipeline: PipelineStage[]) => {
  return Package.aggregate(pipeline);
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
