import { Document, Types } from 'mongoose';

export interface ICreateModule extends Document {
  label: string;
  name: string;
  tenant_id: Types.ObjectId;
  status: 'ACTIVE' | 'INACTIVE';
}
export interface IModuleList {
  label: string;
  name: string;
  tenant_id: Types.ObjectId;
}
