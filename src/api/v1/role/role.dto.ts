import mongoose, { Document } from 'mongoose';

export interface ICreateRole extends Document {
  name: string;
  permissions: PermissionTypes[];
  status: 'ACTIVE' | 'INACTIVE';
}
export interface IRoleList {
  _id?: string;
  name: string;
  permissions: PermissionTypes[];
  status: 'ACTIVE' | 'INACTIVE';
}

export interface IRoleFindAllParams {
  search?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export type PermissionTypes = {
  module_id: mongoose.Types.ObjectId;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
};
