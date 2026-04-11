import { ClientSession, PipelineStage, Types } from 'mongoose';
import {
  IMoneyReceiptFindAllParams,
  IMoneyReceiptList,
} from './moneyReceipt.dto';
import MoneyReceipt from './moneyReceipt.model';

const findAll = ({
  search,
  agent_id,
  tenant_id,
}: IMoneyReceiptFindAllParams) => {
  const query: Record<string, unknown> = { tenant_id };

  // search filter
  if (search) {
    query.$or = [{ name: { $regex: search, $options: 'i' } }];
  }
  if (agent_id) {
    query.agent_id = agent_id;
  }
  return MoneyReceipt.find(query);
};

const findOne = (key: Partial<IMoneyReceiptList>) => {
  // if (key?._id) {
  //   return MoneyReceipt.findById(key._id);
  // }

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
    charge,
    tenant_id,
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
    charge,
    tenant_id,
  });
  return moneyReceipt.save({ ...(session && { session }) });
};

const update = ({
  _id,
  data,
  session,
  tenant_id,
}: {
  _id: Types.ObjectId;
  data: Partial<IMoneyReceiptList>;
  session?: ClientSession | null;
  tenant_id: Types.ObjectId;
}) => {
  return MoneyReceipt.findOneAndUpdate({ _id, tenant_id }, data, {
    returnDocument: 'after',
    runValidators: true,
    ...(session && { session }),
  });
};

const deleteItem = ({
  _id,
  tenant_id,
}: {
  _id: Types.ObjectId;
  tenant_id: Types.ObjectId;
}) => {
  return MoneyReceipt.findOneAndDelete({ _id, tenant_id });
};

const count = ({ search, agent_id, tenant_id }: IMoneyReceiptFindAllParams) => {
  const query: Record<string, unknown> = { tenant_id };

  // search filter
  if (search) {
    query.$or = [{ name: { $regex: search, $options: 'i' } }];
  }

  if (agent_id) {
    query.agent_id = agent_id;
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
