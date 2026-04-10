import { Document, Types } from 'mongoose';

export interface ICreateAccountTransaction extends Document {
  account_id: Types.ObjectId;
  reference_type?:
    | 'MoneyReceipt'
    | 'Agent'
    | 'ExpenseHistory'
    | 'Account'
    | 'AgentPayment';
  reference_id?: Types.ObjectId;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  voucher_no: string;
  description: string;
  date: Date;
}
export interface IAccountTransactionList {
  _id?: string;
  account_id: string | Types.ObjectId;
  reference_type?:
    | 'MoneyReceipt'
    | 'Agent'
    | 'ExpenseHistory'
    | 'Account'
    | 'AgentPayment';
  reference_id?: Types.ObjectId | string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  voucher_no: string;
  description: string;
  date?: string;
}

export interface IAccountTransactionFindAllParams {
  account_id?: Types.ObjectId | string;
  reference_id?: Types.ObjectId | string;
  from_date?: string;
  to_date?: string;
}
