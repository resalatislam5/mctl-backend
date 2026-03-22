import { Document, Types } from 'mongoose';

export interface ICreateAgentPayment extends Document {
  agent_id: Types.ObjectId;
  commission_id: Types.ObjectId;
  payment_method: 'CASH' | 'BANK' | 'MOBILE_BANKING';
  acc_id: Types.ObjectId;
  amount: string;
  paid_amount: string;
  voucher_no: string;
  date: string;
  reference_no?: string;
  note?: string;
}

export interface IAgentPaymentList {
  _id?: string;
  agent_id: Types.ObjectId;
  commission_id: Types.ObjectId;
  payment_method: 'CASH' | 'BANK' | 'MOBILE_BANKING';
  acc_id: Types.ObjectId;
  amount: string;
  paid_amount: string;
  voucher_no: string;
  date: string;
  reference_no: string;
  note: string;
}

export interface IAgentPaymentFindAllParams {
  search?: string;
  agent_id?: string;
  batch_id?: string;
}
