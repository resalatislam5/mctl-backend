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
  tenant_id,
  is_balance_transfer,
}: IAccountTransactionFindAllParams) => {
  const query: any = { tenant_id };

  if (account_id) {
    query.account_id = account_id;
  }
  if (reference_id) {
    query.reference_id = reference_id;
  }

  if (from_date || to_date) {
    query.createdAt = formatDateRange(from_date, to_date);
  }
  if (is_balance_transfer === 'true') {
    query.is_balance_transfer = true;
  }
  if (is_balance_transfer === 'false') {
    query.is_balance_transfer = { $ne: true };
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
    tenant_id,
    is_balance_transfer,
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
    tenant_id,
    is_balance_transfer,
  });
  return data.save({ ...(session && { session }) });
};

const findOne = (key: Partial<IAccountTransactionList>) => {
  return AccountTransaction.findOne(key);
};

const update = ({
  _id,
  data,
  session,
  tenant_id,
}: {
  _id: string | Types.ObjectId;
  data: UpdateQuery<IAccountTransactionList>;
  session?: ClientSession | null;
  tenant_id: Types.ObjectId;
}) => {
  return AccountTransaction.findOneAndUpdate({ _id, tenant_id }, data, {
    returnDocument: 'after',
    runValidators: true,
    ...(session && { session }),
  });
};

const count = ({ account_id, tenant_id }: IAccountTransactionFindAllParams) => {
  const query: any = { tenant_id };

  // name filter
  if (account_id) {
    query.account_id = account_id;
  }

  return AccountTransaction.countDocuments(query);
};

const deleteItem = ({
  _id,
  tenant_id,
}: {
  _id: Types.ObjectId;
  tenant_id: Types.ObjectId;
}) => {
  return AccountTransaction.findOneAndDelete({ _id, tenant_id });
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
