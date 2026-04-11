import mongoose, { Document, Types } from 'mongoose';
import { IStatus } from '../../../types/commonTypes';

export interface IBasePackage {
  name: string;
  course_ids: Types.ObjectId[];
  total_price: number;
  net_price: number;
  discount: number;
  additional_discount: number;
  status: IStatus;
  tenant_id: Types.ObjectId;
}
export interface ICreatePackage extends IBasePackage, Document {}
export interface IPackageList extends IBasePackage {
  _id?: Types.ObjectId;
}

export interface IPackageFindAllParams {
  search?: string;
  status: IStatus;
  tenant_id: Types.ObjectId;
}
