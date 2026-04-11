import { Document, Types } from 'mongoose';
import { IPaymentMethod } from '../../../types/commonTypes';

export interface IBaseAgentPayment {
  agent_id: Types.ObjectId;
  commission_id: Types.ObjectId;
  tenant_id: Types.ObjectId;
  payment_method: IPaymentMethod;
  acc_id: Types.ObjectId;
  amount: number;
  paid_amount: number;
  voucher_no: string;
  date: string;
  reference_no?: string;
  note?: string;
}
export interface ICreateAgentPayment extends IBaseAgentPayment, Document {}

export interface IAgentPaymentList extends IBaseAgentPayment {
  _id?: Types.ObjectId;
}

export interface IAgentPaymentFindAllParams {
  search?: string;
  agent_id?: Types.ObjectId;
  batch_id?: Types.ObjectId;
  tenant_id: Types.ObjectId;
}
