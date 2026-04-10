import { Document, Types } from 'mongoose';

export interface ICreateAccount extends Document {
  account_type: 'CASH' | 'BANK' | 'MOBILE_BANKING';
  name: string;
  acc_number: string;
  bank_name: string;
  branch_name: string;
  opening_balance: number;
  available_balance: number;
  balance_transfer: 'YES' | 'NO';
  transfer_acc_type: 'CASH' | 'BANK' | 'MOBILE_BANKING';
  transfer_acc_id: Types.ObjectId;
  charge_percent: number;
  status: 'ACTIVE' | 'INACTIVE';
}
export interface IAccountList {
  _id?: string | Types.ObjectId;
  account_type: 'CASH' | 'BANK' | 'MOBILE_BANKING';
  name: string;
  acc_number: string;
  bank_name: string;
  branch_name: string;
  opening_balance: number;
  available_balance: number;
  balance_transfer: 'YES' | 'NO';
  transfer_acc_type: 'CASH' | 'BANK' | 'MOBILE_BANKING';
  transfer_acc_id: Types.ObjectId;
  charge_percent: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface IAccountFindAllParams {
  search?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  account_type?: string;
}
