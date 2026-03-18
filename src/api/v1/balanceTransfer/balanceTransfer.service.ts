import { ClientSession, PipelineStage } from 'mongoose';
import {
  IBalanceTransferFindAllParams,
  IBalanceTransferList,
} from './balanceTransfer.dto';
import { BalanceTransfer } from './balanceTransfer.model';

const findAll = ({ search }: IBalanceTransferFindAllParams) => {
  const query: any = {};

  if (search) {
    query.$or = [{ name: { $regex: search, $options: 'i' } }];
  }

  return BalanceTransfer.find(query);
};

const findOne = ({ key }: { key?: Partial<IBalanceTransferList> }) => {
  if (key?._id) {
    return BalanceTransfer.findById(key._id);
  }

  return BalanceTransfer.findOne(key);
};

const create = (
  {
    amount,
    date,
    from_acc_id,
    note,
    to_acc_id,
    voucher_no,
  }: IBalanceTransferList,
  session?: ClientSession | null,
) => {
  const data = new BalanceTransfer({
    amount,
    date,
    from_acc_id,
    note,
    to_acc_id,
    voucher_no,
  });
  return data.save({ ...(session && { session }) });
};

const update = (
  _id: string,
  data: Partial<IBalanceTransferList>,
  session?: ClientSession | null,
) => {
  return BalanceTransfer.findByIdAndUpdate(_id, data, {
    returnDocument: 'after',
    runValidators: true,
    ...(session && { session }),
  });
};

const deleteItem = (_id: string) => {
  return BalanceTransfer.findByIdAndDelete(_id);
};

const count = ({ search }: IBalanceTransferFindAllParams) => {
  const query: any = {};

  // search filter
  if (search) {
    query.$or = [{ name: { $regex: search, $options: 'i' } }];
  }

  return BalanceTransfer.countDocuments(query);
};

const aggregate = (pipeline: PipelineStage[]) => {
  return BalanceTransfer.aggregate(pipeline);
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
