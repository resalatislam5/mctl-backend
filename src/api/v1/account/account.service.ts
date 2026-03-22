import { ClientSession, Types } from 'mongoose';
import { IAccountFindAllParams, IAccountList } from './account.dto';
import Account from './account.model';
import { UpdateQuery } from 'mongoose';

const findAll = ({ search, account_type, status }: IAccountFindAllParams) => {
  const query: Record<string, unknown> = {};

  // search filter
  if (search) {
    query.$or = [{ name: { $regex: search, $options: 'i' } }];
  }
  if (status) {
    query.status = {
      $regex: `^${status.trim()}$`,
      $options: 'i', // ignore case
    };
  }
  if (account_type) {
    query.account_type = {
      $regex: `^${account_type.trim()}$`,
      $options: 'i', // ignore case
    };
  }

  return Account.find(query);
};

const findOne = ({ key }: { key?: Partial<IAccountList> }) => {
  if (key?._id) {
    return Account.findById(key._id);
  }

  return Account.findOne(key);
};

const create = ({
  name,
  acc_number,
  account_type,
  bank_name,
  branch_name,
  opening_balance,
  available_balance,
  charge_percent,
  status,
}: IAccountList) => {
  const account = new Account({
    name,
    acc_number,
    account_type,
    bank_name,
    branch_name,
    opening_balance,
    available_balance,
    charge_percent,
    status,
  });
  return account.save();
};

const update = (
  _id: string | Types.ObjectId,
  data: UpdateQuery<IAccountList>,
  session?: ClientSession | null,
) => {
  return Account.findByIdAndUpdate(_id, data, {
    returnDocument: 'after',
    runValidators: true,
    ...(session && { session }),
  });
};

const deleteItem = (_id: string) => {
  return Account.findByIdAndDelete(_id);
};

const count = ({ search, status }: IAccountFindAllParams) => {
  const query: Record<string, unknown> = {};

  // search filter
  if (search) {
    query.$or = [{ name: { $regex: search, $options: 'i' } }];
  }

  if (status) {
    query.status = status;
  }

  return Account.countDocuments(query);
};

export default { findAll, findOne, create, update, deleteItem, count };
