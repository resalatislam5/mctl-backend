import { Document, Types } from 'mongoose';

export interface IBaseHead {
  name: string;
  tenant_id: Types.ObjectId;
}
export interface ICreateHead extends IBaseHead, Document {}
export interface IHeadList extends IBaseHead {
  _id?: Types.ObjectId;
}

export interface IHeadFindAllParams {
  search?: string;
  tenant_id: Types.ObjectId;
}
