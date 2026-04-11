import { Document, Types } from 'mongoose';
import { IStatus } from '../../../types/commonTypes';

export interface IBaseBatch {
  batch_no: string;
  tenant_id: Types.ObjectId;
  status: IStatus;
}
export interface ICreateBatch extends IBaseBatch, Document {}
export interface IBatchList extends IBaseBatch {
  _id?: Types.ObjectId;
}

export interface IBatchFindAllParams {
  search?: string;
  status: IStatus;
  tenant_id: Types.ObjectId;
}
