import { ClientSession, PipelineStage } from 'mongoose';
import {
  IMoneyReceiptFindAllParams,
  IMoneyReceiptList,
} from './moneyReceipt.dto';
import MoneyReceipt from './moneyReceipt.model';

const findAll = ({ search, agent_id }: IMoneyReceiptFindAllParams) => {
  const query: Record<string, unknown> = {};

  // search filter
  if (search) {
    query.$or = [{ name: { $regex: search, $options: 'i' } }];
  }
  if (agent_id) {
    query.agent_id = agent_id;
  }
  return MoneyReceipt.find(query);
};

const findOne = ({ key }: { key?: Partial<IMoneyReceiptList> }) => {
  if (key?._id) {
    return MoneyReceipt.findById(key._id);
  }

  return MoneyReceipt.findOne(key);
};

const create = (
  {
    acc_id,
    amount,
    enrollment_id,
    paid_amount,
    payment_method,
    voucher_no,
    student_id,
    date,
  }: IMoneyReceiptList,
  session?: ClientSession | null,
) => {
  const moneyReceipt = new MoneyReceipt({
    acc_id,
    amount,
    enrollment_id,
    paid_amount,
    payment_method,
    voucher_no,
    student_id,
    date,
  });
  return moneyReceipt.save({ ...(session && { session }) });
};

const update = (
  _id: string,
  data: Partial<IMoneyReceiptList>,
  session?: ClientSession | null,
) => {
  return MoneyReceipt.findByIdAndUpdate(_id, data, {
    returnDocument: 'after',
    runValidators: true,
    ...(session && { session }),
  });
};

const deleteItem = (_id: string) => {
  return MoneyReceipt.findByIdAndDelete(_id);
};

const count = ({ search }: IMoneyReceiptFindAllParams) => {
  const query: Record<string, unknown> = {};

  // search filter
  if (search) {
    query.$or = [{ name: { $regex: search, $options: 'i' } }];
  }

  return MoneyReceipt.countDocuments(query);
};

const aggregate = (pipeline: PipelineStage[]) => {
  return MoneyReceipt.aggregate(pipeline);
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
