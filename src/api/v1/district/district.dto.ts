import mongoose, { Document } from 'mongoose';

export interface ICreateDistrict extends Document {
  name: string;
  code: string;
  division_id: mongoose.Types.ObjectId;
  status: 'ACTIVE' | 'INACTIVE';
}
export interface IDistrictList {
  _id?: string;
  name: string;
  code: string;
  division_id: mongoose.Types.ObjectId;
  status: 'ACTIVE' | 'INACTIVE';
}
