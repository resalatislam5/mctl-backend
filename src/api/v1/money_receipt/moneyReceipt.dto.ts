import { Document, Types } from 'mongoose';
import { IPaymentMethod } from '../../../types/commonTypes';

export interface IBaseMoneyReceipt {
  payment_method: IPaymentMethod;
  acc_id: Types.ObjectId;
  enrollment_id: Types.ObjectId;
  student_id: Types.ObjectId;
  tenant_id: Types.ObjectId;
  amount: number;
  paid_amount: number;
  voucher_no: string;
  charge: number;
  date: string;
}
export interface ICreateMoneyReceipt extends IBaseMoneyReceipt, Document {}
export interface IMoneyReceiptList extends IBaseMoneyReceipt {
  _id?: Types.ObjectId;
}

export interface IMoneyReceiptFindAllParams {
  search?: string;
  agent_id?: Types.ObjectId;
  batch_id?: Types.ObjectId;
  tenant_id: Types.ObjectId;
}
