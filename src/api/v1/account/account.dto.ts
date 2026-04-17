import { Document, Types } from 'mongoose';
import { IPaymentMethod, IStatus } from '../../../types/commonTypes';

export interface IBaseAccount {
  account_type: IPaymentMethod;
  name: string;
  acc_number: string;
  bank_name: string;
  branch_name: string;
  opening_balance: number;
  balance_transfer: 'YES' | 'NO';
  transfer_acc_type: IPaymentMethod;
  transfer_acc_id: Types.ObjectId;
  charge_percent: number;
  tenant_id: Types.ObjectId;
  status: IStatus;
}
export interface ICreateAccount extends IBaseAccount, Document {}
export interface IAccountList extends IBaseAccount {
  _id?: string | Types.ObjectId;
}

export interface IAccountFindAllParams {
  search?: string;
  status?: IStatus;
  account_type?: string;
  tenant_id: Types.ObjectId;
}
