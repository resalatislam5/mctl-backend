import { Types } from 'mongoose';
import { IBatchFindAllParams, IBatchList, ICreateBatch } from './batch.dto';
import Batch from './batch.model';

const findAll = ({ search, status, tenant_id }: IBatchFindAllParams) => {
  const query: any = { tenant_id };

  if (search) {
    query.$or = [{ batch_no: { $regex: search, $options: 'i' } }];
  }
  if (status) {
    query.status = status;
  }
  return Batch.find(query);
};

const findOne = (key: Partial<IBatchList>) => {
  return Batch.findOne(key);
};

const create = ({ batch_no, status, tenant_id }: IBatchList) => {
  const batch = new Batch({ batch_no, status, tenant_id });
  return batch.save();
};

const update = ({
  _id,
  tenant_id,
  data,
}: {
  _id: Types.ObjectId;
  data: Partial<IBatchList>;
  tenant_id: Types.ObjectId;
}) => {
  return Batch.findOneAndUpdate({ _id, tenant_id }, data, { new: true });
};

const deleteItem = ({
  _id,
  tenant_id,
}: {
  _id: Types.ObjectId;
  tenant_id: Types.ObjectId;
}) => {
  return Batch.findOneAndDelete({ _id, tenant_id });
};

const count = ({ search, status, tenant_id }: IBatchFindAllParams) => {
  const query: any = { tenant_id };

  // batch_no filter
  if (status) {
    query.status = status;
  }
  // search filter
  if (search) {
    query.$or = [{ batch_no: { $regex: search, $options: 'i' } }];
  }

  if (status) {
    query.status = status;
  }

  return Batch.countDocuments(query);
};

export default { findAll, findOne, create, update, deleteItem, count };
