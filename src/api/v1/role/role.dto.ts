import mongoose, { Document, Types } from 'mongoose';
import { IStatus } from '../../../types/commonTypes';

export interface IBaseRole {
  tenant_id: Types.ObjectId;
  name: string;
  permissions: PermissionTypes[];
  status: IStatus;
}

export interface ICreateRole extends IBaseRole, Document {}
export interface IRoleList extends IBaseRole {
  _id?: Types.ObjectId | string;
}

export interface IRoleFindAllParams {
  search?: string;
  status: IStatus;
  tenant_id: Types.ObjectId;
}

export type PermissionTypes = {
  module_id: mongoose.Types.ObjectId;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
};
