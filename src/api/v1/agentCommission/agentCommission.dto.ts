import { Document, Types } from 'mongoose';

type AgentCommissionStatus = 'PENDING' | 'APPROVED' | 'PAID';
export interface IBaseAgentCommission {
  agent_id: Types.ObjectId;
  batch_id: Types.ObjectId;
  tenant_id: Types.ObjectId;
  total_students: number;
  eligible_students: number;
  total_amount: number;
  min_limit: number;
  commission_rate: number;
  commission_amount: number;
  paid_amount: number;
  status: AgentCommissionStatus;
}
export interface ICreateAgentCommission
  extends IBaseAgentCommission, Document {}
export interface IAgentCommissionList extends Omit<
  IBaseAgentCommission,
  'paid_amount' | 'status'
> {
  _id?: string | Types.ObjectId;
  paid_amount?: number;
  status?: AgentCommissionStatus;
}

export interface IAgentCommissionFindAllParams {
  search?: string;
  agent_id?: Types.ObjectId;
  batch_id?: Types.ObjectId;
  status?: AgentCommissionStatus;
  tenant_id: Types.ObjectId;
}
