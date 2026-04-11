import { ClientSession, PipelineStage, Types } from 'mongoose';
import {
  IExpenseHistoryFindAllParams,
  IExpenseHistoryList,
} from './expenseHistory.dto';
import { ExpenseHistory } from './expenseHistory.model';

const findAll = ({ search, tenant_id }: IExpenseHistoryFindAllParams) => {
  const query: any = { tenant_id };

  if (search) {
    query.$or = [{ name: { $regex: search, $options: 'i' } }];
  }

  return ExpenseHistory.find(query);
};

const findOne = (key: Partial<IExpenseHistoryList>) => {
  return ExpenseHistory.findOne(key);
};

const create = ({
  acc_id,
  account_type,
  date,
  expense_details,
  note,
  total_amount,
  voucher_no,
  tenant_id,
}: IExpenseHistoryList) => {
  const data = new ExpenseHistory({
    acc_id,
    account_type,
    date,
    expense_details,
    note,
    total_amount,
    voucher_no,
    tenant_id,
  });
  return data.save();
};

const update = ({
  _id,
  data,
  session,
  tenant_id,
}: {
  _id: Types.ObjectId;
  data: Partial<IExpenseHistoryList>;
  session: ClientSession | null;
  tenant_id: Types.ObjectId;
}) => {
  return ExpenseHistory.findOneAndUpdate({ _id, tenant_id }, data, {
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
  return ExpenseHistory.findOneAndDelete({ _id, tenant_id });
};

const count = ({ search, tenant_id }: IExpenseHistoryFindAllParams) => {
  const query: any = { tenant_id };

  // search filter
  if (search) {
    query.$or = [{ name: { $regex: search, $options: 'i' } }];
  }

  return ExpenseHistory.countDocuments(query);
};

const aggregate = (pipeline: PipelineStage[]) => {
  return ExpenseHistory.aggregate(pipeline);
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
