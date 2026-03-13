import { PipelineStage } from 'mongoose';
import { IHeadFindAllParams, IHeadList } from './head.dto';
import { Head } from './head.model';

const findAll = ({ search }: IHeadFindAllParams) => {
  const query: any = {};

  if (search) {
    query.$or = [{ name: { $regex: search, $options: 'i' } }];
  }

  return Head.find(query);
};

const findOne = ({ key }: { key?: Partial<IHeadList> }) => {
  if (key?._id) {
    return Head.findById(key._id);
  }

  return Head.findOne(key);
};

const create = ({ name }: IHeadList) => {
  const data = new Head({
    name,
  });
  return data.save();
};

const update = (_id: string, data: Partial<IHeadList>) => {
  return Head.findByIdAndUpdate(_id, data, { new: true });
};

const deleteItem = (_id: string) => {
  return Head.findByIdAndDelete(_id);
};

const count = ({ search }: IHeadFindAllParams) => {
  const query: any = {};

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
