import { Document, Schema } from 'mongoose';

export interface ICreateHead extends Document {
  name: string;
}
export interface IHeadList {
  _id?: string;
  name: string;
}

export interface IHeadFindAllParams {
  search?: string;
}
