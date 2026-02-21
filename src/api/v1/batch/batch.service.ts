import { IBatchFindAllParams, IBatchList, ICreateBatch } from './batch.dto';
import Batch from './batch.model';

const findAll = ({ search, status }: IBatchFindAllParams) => {
  const query: any = {};

  // batch_no filter

  // search filter
  if (search) {
    query.$or = [{ batch_no: { $regex: search, $options: 'i' } }];
  }
  if (status) {
    query.status = status;
  }
  return Batch.find(query);
};

const findOne = ({ key }: { key?: Partial<IBatchList> }) => {
  if (key?._id) {
    return Batch.findById(key._id);
  }

  return Batch.findOne(key);
};

const create = ({ batch_no, status }: IBatchList) => {
  const batch = new Batch({ batch_no, status });
  return batch.save();
};

const update = (_id: string, data: Partial<IBatchList>) => {
  return Batch.findByIdAndUpdate(_id, data, { new: true });
};

const deleteItem = (_id: string) => {
  return Batch.findByIdAndDelete(_id);
};

const count = ({ search, status }: IBatchFindAllParams) => {
  const query: any = {};

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
