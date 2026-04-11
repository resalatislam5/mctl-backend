import { ClientSession, PipelineStage, Types } from 'mongoose';
import {
  IBalanceTransferFindAllParams,
  IBalanceTransferList,
} from './balanceTransfer.dto';
import { BalanceTransfer } from './balanceTransfer.model';

const findAll = ({ search, tenant_id }: IBalanceTransferFindAllParams) => {
  const query: any = { tenant_id };

  if (search) {
    query.$or = [{ name: { $regex: search, $options: 'i' } }];
  }

  return BalanceTransfer.find(query);
};

const findOne = (key: Partial<IBalanceTransferList>) => {
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
    tenant_id,
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
    tenant_id,
  });
  return data.save({ ...(session && { session }) });
};

const update = ({
  _id,
  data,
  session,
  tenant_id,
}: {
  _id: Types.ObjectId;
  data: Partial<IBalanceTransferList>;
  session?: ClientSession | null;
  tenant_id: Types.ObjectId;
}) => {
  return BalanceTransfer.findOneAndUpdate({ _id, tenant_id }, data, {
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
  return BalanceTransfer.findOneAndDelete({ _id, tenant_id });
};

const count = ({ search, tenant_id }: IBalanceTransferFindAllParams) => {
  const query: any = { tenant_id };

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
