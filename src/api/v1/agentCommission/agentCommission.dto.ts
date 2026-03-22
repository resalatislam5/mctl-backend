import { Document, Types } from 'mongoose';

export interface ICreateAgentCommission extends Document {
  agent_id: Types.ObjectId;
  batch_id: Types.ObjectId;
  total_students: number;
  eligible_students: number;
  total_amount: string;
  commission_rate: number;
  commission_amount: string;
  paid_amount: string;
  status: 'PENDING' | 'APPROVED' | 'PAID';
}
export interface IAgentCommissionList {
  _id?: string | Types.ObjectId;
  agent_id: string;
  batch_id: string;
  total_students: number;
  eligible_students: number;
  total_amount: string;
  commission_rate: number;
  commission_amount: string;
  paid_amount?: string;
  status?: 'PENDING' | 'APPROVED' | 'PAID';
}

export interface IAgentCommissionFindAllParams {
  search?: string;
  agent_id?: Types.ObjectId;
  batch_id?: Types.ObjectId;
  status?: 'PENDING' | 'APPROVED' | 'PAID';
}
