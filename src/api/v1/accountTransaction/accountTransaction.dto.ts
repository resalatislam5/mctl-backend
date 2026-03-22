import { Document, Types } from 'mongoose';

export interface ICreateAccountTransaction extends Document {
  account_id: Types.ObjectId;
  reference_type?: 'MoneyReceipt' | 'Agent' | 'ExpenseHistory';
  reference_id?: Types.ObjectId;

  type: 'CREDIT' | 'DEBIT';
  amount: String;
  voucher_no: String;
  charge: String;
  description: String;
  date: String;
}
export interface IAccountTransactionList {
  _id?: string;
  account_id: String;
  reference_type?: 'MoneyReceipt' | 'Agent' | 'ExpenseHistory';
  reference_id?: Types.ObjectId;
  type: 'CREDIT' | 'DEBIT';
  amount: String;
  voucher_no: String;
  charge?: String;
  description: String;
  date?: String;
}

export interface IAccountTransactionFindAllParams {
  account_id?: Types.ObjectId | string;
  from_date?: string;
  to_date?: string;
}
