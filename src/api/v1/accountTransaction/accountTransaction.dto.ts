import { Document, Types } from 'mongoose';

export interface IBaseAccountTransaction {
  account_id: Types.ObjectId;
  reference_type?:
    | 'MoneyReceipt'
    | 'Agent'
    | 'ExpenseHistory'
    | 'Account'
    | 'AgentPayment'
    | 'BalanceTransfer';
  reference_id?: Types.ObjectId;
  tenant_id: Types.ObjectId;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  voucher_no: string;
  description: string;
  date: Date;
  is_balance_transfer?: boolean;
}
export interface ICreateAccountTransaction
  extends IBaseAccountTransaction, Document {}
export interface IAccountTransactionList extends Omit<
  IBaseAccountTransaction,
  'date'
> {
  _id?: Types.ObjectId;
  date?: Date;
}

export interface IAccountTransactionFindAllParams {
  account_id?: Types.ObjectId;
  reference_id?: Types.ObjectId;
  tenant_id: Types.ObjectId;
  from_date?: string;
  to_date?: string;
  is_balance_transfer?: string;
}
