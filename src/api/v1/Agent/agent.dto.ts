import { Document } from 'mongoose';

export interface ICreateAgent extends Document {
  name: string;
  email: string;
  mobile_no: string;
  min_limit: number;
  commission: number;
  total_amount: number;
  paid_amount: number;
  status: 'ACTIVE' | 'INACTIVE';
}
export interface IAgentList {
  _id?: string;
  name: string;
  email: string;
  mobile_no: string;
  min_limit: number;
  commission: number;
  total_amount: number;
  paid_amount: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface IAgentFindAllParams {
  search?: string;
  status: 'ACTIVE' | 'INACTIVE';
}
