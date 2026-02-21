import { Document } from 'mongoose';

export interface ICreateModule extends Document {
  label: string;
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
}
export interface IModuleList {
  label: string;
  name: string;
}
