import {
  ClientSession,
  DeleteResult,
  Query,
  Types,
  UpdateQuery,
} from 'mongoose';
import {
  IAccountTransactionFindAllParams,
  IAccountTransactionList,
} from './accountTransaction.dto';
import AccountTransaction from './accountTransaction.model';
import { formatDateRange } from '../../../utils/DataFormat';

const findAll = ({
  account_id,
  from_date,
  to_date,
  reference_id,
}: IAccountTransactionFindAllParams) => {
  const query: any = {};

  if (account_id) {
    query.account_id = account_id;
  }
  if (reference_id) {
    query.reference_id = reference_id;
  }

  if (from_date || to_date) {
    query.createdAt = formatDateRange(from_date, to_date);
  }
  return AccountTransaction.find(query);
};

const create = (
  {
    account_id,
    amount,
    date,
    description,
    reference_type,
    reference_id,
    voucher_no,
    type,
  }: IAccountTransactionList,
  session?: ClientSession | null,
) => {
  const data = new AccountTransaction({
    account_id,
    amount,
    date,
    description,
    reference_type,
    reference_id,
    voucher_no,
    type,
  });
  return data.save({ ...(session && { session }) });
};

const findOne = ({ key }: { key?: Partial<IAccountTransactionList> }) => {
  if (key?._id) {
    return AccountTransaction.findById(key._id);
  }

  return AccountTransaction.findOne(key);
};

const update = (
  _id: string | Types.ObjectId,
  data: UpdateQuery<IAccountTransactionList>,
  session?: ClientSession | null,
) => {
  return AccountTransaction.findByIdAndUpdate(_id, data, {
    returnDocument: 'after',
    runValidators: true,
    ...(session && { session }),
  });
};

const count = ({ account_id }: IAccountTransactionFindAllParams) => {
  const query: any = {};

  // name filter
  if (account_id) {
    query.account_id = account_id;
  }

  return AccountTransaction.countDocuments(query);
};

const deleteItem = (_id: string) => {
  return AccountTransaction.findByIdAndDelete(_id);
};

const deleteMany = (filter: Record<string, any>): Query<DeleteResult, any> => {
  return AccountTransaction.deleteMany(filter);
};

export default {
  findAll,
  create,
  findOne,
  update,
  count,
  deleteItem,
  deleteMany,
};
