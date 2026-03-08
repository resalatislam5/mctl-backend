import mongoose, { Document } from 'mongoose';

export interface ICreateAccount extends Document {
  account_type: 'CASH' | 'BANK' | 'MOBILE_BANKING';
  name: string;
  acc_number: string;
  bank_name: string;
  branch_name: string;
  opening_balance: string;
  available_balance: string;
  status: 'ACTIVE' | 'INACTIVE';
}
export interface IAccountList {
  _id?: string;
  account_type: 'CASH' | 'BANK' | 'MOBILE_BANKING';
  name: string;
  acc_number: string;
  bank_name: string;
  branch_name: string;
  opening_balance: string;
  available_balance: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface IAccountFindAllParams {
  search?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  account_type?: string;
}
