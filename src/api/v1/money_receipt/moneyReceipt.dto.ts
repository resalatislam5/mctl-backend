import { Document, Types } from 'mongoose';

export interface ICreateMoneyReceipt extends Document {
  payment_method: 'CASH' | 'BANK' | 'MOBILE_BANKING';
  acc_id: Types.ObjectId;
  enrollment_id: Types.ObjectId;
  student_id: Types.ObjectId;
  amount: number;
  paid_amount: number;
  voucher_no: string;
  charge: number;
  date: string;
}
export interface IMoneyReceiptList {
  _id?: string;
  payment_method: 'CASH' | 'BANK' | 'MOBILE_BANKING';
  acc_id: string;
  enrollment_id: string;
  student_id: string;
  amount: number;
  voucher_no: string;
  charge: number;
  paid_amount: number;
  date: string;
}

export interface IMoneyReceiptFindAllParams {
  search?: string;
  agent_id?: string;
  batch_id?: string;
}
