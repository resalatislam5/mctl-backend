import { PipelineStage, Types } from 'mongoose';
import { IHeadFindAllParams, IHeadList } from './head.dto';
import { Head } from './head.model';

const findAll = ({ search, tenant_id }: IHeadFindAllParams) => {
  const query: any = { tenant_id };

  if (search) {
    query.$or = [{ name: { $regex: search, $options: 'i' } }];
  }

  return Head.find(query);
};

const findOne = (key: Partial<IHeadList>) => {
  return Head.findOne(key);
};

const create = ({ name, tenant_id }: IHeadList) => {
  const data = new Head({
    name,
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
  data: Partial<IHeadList>;
  tenant_id: Types.ObjectId;
}) => {
  return Head.findOneAndUpdate({ _id, tenant_id }, data, { new: true });
};

const deleteItem = ({
  _id,
  tenant_id,
}: {
  _id: Types.ObjectId;
  tenant_id: Types.ObjectId;
}) => {
  return Head.findOneAndDelete({ _id, tenant_id });
};

const count = ({ search, tenant_id }: IHeadFindAllParams) => {
  const query: any = { tenant_id };

  // search filter
  if (search) {
    query.$or = [{ name: { $regex: search, $options: 'i' } }];
  }

  return Head.countDocuments(query);
};

const aggregate = (pipeline: PipelineStage[]) => {
  return Head.aggregate(pipeline);
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
