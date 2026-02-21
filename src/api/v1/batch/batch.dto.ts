import { Document } from 'mongoose';

export interface ICreateBatch extends Document {
  batch_no: string;
  status: 'ACTIVE' | 'INACTIVE';
}
export interface IBatchList {
  _id?: string;
  batch_no: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface IBatchFindAllParams {
  search?: string;
  status: 'ACTIVE' | 'INACTIVE';
}
