import { Document, Types } from 'mongoose';

export interface ICreateAccountTransaction extends Document {
  account_id: Types.ObjectId;
  reference_type?: 'MoneyReceipt' | 'Agent' | 'ExpenseHistory' | 'Account';
  reference_id?: Types.ObjectId;
  type: 'CREDIT' | 'DEBIT';
  amount: String;
  voucher_no: String;
  description: String;
  date: String;
}
export interface IAccountTransactionList {
  _id?: string;
  account_id: String | Types.ObjectId;
  reference_type?: 'MoneyReceipt' | 'Agent' | 'ExpenseHistory' | 'Account';
  reference_id?: Types.ObjectId;
  type: 'CREDIT' | 'DEBIT';
  amount: String;
  voucher_no: String;
  description: String;
  date?: String;
}

export interface IAccountTransactionFindAllParams {
  account_id?: Types.ObjectId | string;
  from_date?: string;
  to_date?: string;
}
