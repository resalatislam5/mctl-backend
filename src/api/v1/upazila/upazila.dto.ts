import mongoose, { Document } from 'mongoose';

export interface ICreateUpazila extends Document {
  name: string;
  code: string;
  district_id: mongoose.Types.ObjectId;
  status: 'ACTIVE' | 'INACTIVE';
}
export interface IUpazilaList {
  _id?: string;
  name: string;
  code: string;
  district_id: mongoose.Types.ObjectId;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface IUpazilaFindAllParams {
  search?: string;
  district_id?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}
