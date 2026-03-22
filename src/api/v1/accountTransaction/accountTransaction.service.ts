import { ClientSession, UpdateQuery } from 'mongoose';
import {
  IAccountTransactionFindAllParams,
  IAccountTransactionList,
} from './accountTransaction.dto';
import AccountTransaction from './accountTransaction.model';

const findAll = ({
  account_id,
  from_date,
  to_date,
}: IAccountTransactionFindAllParams) => {
  const query: any = {};

  if (account_id) {
    query.account_id = account_id;
  }

  if (from_date || to_date) {
    const dateFilter: any = {};

    if (from_date) {
      dateFilter.$gte = new Date(from_date);
    }

    if (to_date) {
      const toDate = new Date(to_date);
      toDate.setHours(23, 59, 59, 999); // include entire day
      dateFilter.$lte = toDate;
    }

    query.createdAt = dateFilter;
  }
  return AccountTransaction.find(query);
};

const create = (
  {
    account_id,
    amount,
    charge,
    date,
    description,
    reference_type,
    reference_id,
    voucher_no,
    type,
  }: IAccountTransactionList,
  session: ClientSession | null,
) => {
  const data = new AccountTransaction({
    account_id,
    amount,
    charge,
    date,
    description,
    reference_type,
    reference_id,
    voucher_no,
    type,
  });
  return data.save({ session });
};

const findOne = ({ key }: { key?: Partial<IAccountTransactionList> }) => {
  if (key?._id) {
    return AccountTransaction.findById(key._id);
  }

  return AccountTransaction.findOne(key);
};

const update = (
  _id: string,
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

export default { findAll, create, findOne, update, count, deleteItem };
