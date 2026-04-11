import { Document, Types } from 'mongoose';
import { IStatus } from '../../../types/commonTypes';

export interface IBaseAgent {
  name: string;
  email: string;
  mobile_no: string;
  min_limit: number;
  commission: number;
  min_payment_percent: number;
  tenant_id: Types.ObjectId;
  status: IStatus;
}
export interface ICreateAgent extends IBaseAgent, Document {}
export interface IAgentList extends IBaseAgent {
  _id?: Types.ObjectId;
}

export interface IAgentFindAllParams {
  search?: string;
  status?: IStatus;
  tenant_id: Types.ObjectId;
}
