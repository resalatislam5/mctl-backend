import { ClientSession, PipelineStage } from 'mongoose';
import {
  IExpenseHistoryFindAllParams,
  IExpenseHistoryList,
} from './expenseHistory.dto';
import { ExpenseHistory } from './expenseHistory.model';

const findAll = ({ search }: IExpenseHistoryFindAllParams) => {
  const query: any = {};

  if (search) {
    query.$or = [{ name: { $regex: search, $options: 'i' } }];
  }

  return ExpenseHistory.find(query);
};

const findOne = ({ key }: { key?: Partial<IExpenseHistoryList> }) => {
  if (key?._id) {
    return ExpenseHistory.findById(key._id);
  }

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
}: IExpenseHistoryList) => {
  const data = new ExpenseHistory({
    acc_id,
    account_type,
    date,
    expense_details,
    note,
    total_amount,
    voucher_no,
  });
  return data.save();
};

const update = (
  _id: string,
  data: Partial<IExpenseHistoryList>,
  session: ClientSession | null,
) => {
  return ExpenseHistory.findByIdAndUpdate(_id, data, {
    returnDocument: 'after',
    runValidators: true,
    ...(session && { session }),
  });
};

const deleteItem = (_id: string) => {
  return ExpenseHistory.findByIdAndDelete(_id);
};

const count = ({ search }: IExpenseHistoryFindAllParams) => {
  const query: any = {};

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
