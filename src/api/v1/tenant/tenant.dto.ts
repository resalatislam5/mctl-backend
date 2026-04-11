import { Document, Types } from 'mongoose';
import { IStatus } from '../../../types/commonTypes';

export interface IBaseTenant {
  name: string;
  email: string;
  status: IStatus;
}
export interface ICreateTenant extends IBaseTenant, Document {}
export interface ITenantList extends IBaseTenant {
  _id?: Types.ObjectId;
}

export interface ITenantFindAllParams {
  search?: string;
  status: IBaseTenant['status'];
}
