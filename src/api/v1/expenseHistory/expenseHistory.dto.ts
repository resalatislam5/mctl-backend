import { Document, Types } from 'mongoose';
import { IPaymentMethod } from '../../../types/commonTypes';

export interface IBaseExpenseHistory {
  expense_details: { head_id: Types.ObjectId; amount: number }[];
  account_type: IPaymentMethod;
  acc_id: Types.ObjectId;
  total_amount: number;
  date: string;
  voucher_no: string;
  note: string;
  tenant_id: Types.ObjectId;
}
export interface ICreateExpenseHistory extends IBaseExpenseHistory, Document {}
export interface IExpenseHistoryList extends IBaseExpenseHistory {
  _id?: Types.ObjectId;
}

export interface IExpenseHistoryFindAllParams {
  search?: string;
  tenant_id: Types.ObjectId;
}
