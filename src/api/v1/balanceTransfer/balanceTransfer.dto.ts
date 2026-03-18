import { Document, Schema, Types } from 'mongoose';

export interface ICreateBalanceTransfer extends Document {
  from_acc_id: Types.ObjectId;
  to_acc_id: Types.ObjectId;
  amount: string;
  date: string;
  note: string;
  voucher_no: string;
}
export interface IBalanceTransferList {
  _id?: string;
  from_acc_id: Types.ObjectId;
  to_acc_id: Types.ObjectId;
  amount: string;
  date: string;
  note: string;
  voucher_no: string;
}

export interface IBalanceTransferFindAllParams {
  search?: string;
}
