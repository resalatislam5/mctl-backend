import { Document, Types } from 'mongoose';

export interface IBaseBalanceTransfer {
  from_acc_id: Types.ObjectId;
  to_acc_id: Types.ObjectId;
  tenant_id: Types.ObjectId;
  amount: number;
  date: string;
  note: string;
  voucher_no: string;
}
export interface ICreateBalanceTransfer
  extends IBaseBalanceTransfer, Document {}
export interface IBalanceTransferList extends IBaseBalanceTransfer {
  _id?: Types.ObjectId;
}

export interface IBalanceTransferFindAllParams {
  search?: string;
  tenant_id: Types.ObjectId;
}
