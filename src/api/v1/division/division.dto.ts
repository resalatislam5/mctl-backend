import mongoose, { Document } from 'mongoose';

export interface ICreateDivision extends Document {
  name: string;
  code: string;
  country_id: mongoose.Types.ObjectId;
  status: 'ACTIVE' | 'INACTIVE';
}
export interface IDivisionList {
  _id?: string;
  name: string;
  code: string;
  country_id: mongoose.Types.ObjectId;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface IDivisionFindAllParams {
  search?: string;
  country_id?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}
