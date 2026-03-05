import mongoose, { Document } from 'mongoose';

export interface ICreatePackage extends Document {
  name: string;
  course_ids: mongoose.Types.ObjectId[];
  total_price: number;
  net_price: number;
  discount: number;
  additional_discount: number;
  status: 'ACTIVE' | 'INACTIVE';
}
export interface IPackageList {
  _id?: string;
  name: string;
  course_ids: string[];
  total_price: number;
  net_price: number;
  discount: number;
  additional_discount: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface IPackageFindAllParams {
  search?: string;
  status: 'ACTIVE' | 'INACTIVE';
}
