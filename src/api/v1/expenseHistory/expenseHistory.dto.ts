import { Document, Schema, Types } from 'mongoose';

export interface ICreateExpenseHistory extends Document {
  expense_details: { head_id: Types.ObjectId; amount: string }[];
  account_type: 'CASH' | 'BANK' | 'MOBILE_BANKING';
  acc_id: Types.ObjectId;
  total_amount: string;
  date: string;
  voucher_no: string;
  note: string;
}
export interface IExpenseHistoryList {
  _id?: string;
  expense_details: { head_id: string; amount: string }[];
  account_type: 'CASH' | 'BANK' | 'MOBILE_BANKING';
  acc_id: string;
  total_amount: string;
  date: string;
  voucher_no: string;
  note: string;
}

export interface IExpenseHistoryFindAllParams {
  search?: string;
}
