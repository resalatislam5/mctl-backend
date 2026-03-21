import { Document, Types } from 'mongoose';

export interface ICreateAccountTransaction extends Document {
  account_id: Types.ObjectId;
  money_receipt_id: Types.ObjectId;
  agent_id: Types.ObjectId;
  expense_id: Types.ObjectId;
  type: 'CREDIT' | 'DEBIT';
  amount: String;
  charge: String;
  description: String;
  date: String;
}
export interface IAccountTransactionList {
  _id?: string;
  account_id: String;
  money_receipt_id?: String;
  agent_id?: String;
  expense_id?: String;
  type: 'CREDIT' | 'DEBIT';
  amount: String;
  charge: String;
  description: String;
  date?: String;
}

export interface IAccountTransactionFindAllParams {
  account_id?: Types.ObjectId | string;
}
