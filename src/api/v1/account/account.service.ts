import { ClientSession, Types } from 'mongoose';
import { IAccountFindAllParams, IAccountList } from './account.dto';
import Account from './account.model';
import { UpdateQuery } from 'mongoose';

const findAll = ({
  search,
  account_type,
  status,
  tenant_id,
}: IAccountFindAllParams) => {
  const query: Record<string, unknown> = { tenant_id };

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

const findOne = (key: Partial<IAccountList>) => {
  return Account.findOne(key);
};

const create = (
  {
    name,
    acc_number,
    account_type,
    bank_name,
    branch_name,
    opening_balance,
    balance_transfer,
    transfer_acc_type,
    transfer_acc_id,
    charge_percent,
    status,
    tenant_id,
  }: IAccountList,
  session?: ClientSession | null,
) => {
  const account = new Account({
    name,
    acc_number,
    account_type,
    bank_name,
    branch_name,
    opening_balance,
    balance_transfer,
    transfer_acc_type,
    transfer_acc_id,
    charge_percent,
    status,
    tenant_id,
  });
  return account.save({ ...(session && { session }) });
};

const update = ({
  _id,
  data,
  session,
  tenant_id,
}: {
  _id: string | Types.ObjectId;
  data: UpdateQuery<IAccountList>;
  session?: ClientSession | null;
  tenant_id: Types.ObjectId;
}) => {
  return Account.findByIdAndUpdate({ _id, tenant_id }, data, {
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
  return Account.findOneAndDelete({ _id, tenant_id });
};

const count = ({ search, status, tenant_id }: IAccountFindAllParams) => {
  const query: Record<string, unknown> = { tenant_id };

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
