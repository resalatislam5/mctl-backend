import { Types } from 'mongoose';

export interface ICreateUser {
  name: string;
  email: string;
  password: string;
  role_id: Types.ObjectId;
  is_owner?: boolean;
  tenant_id: Types.ObjectId;
  status: 'ACTIVE' | 'INACTIVE';
}

export type IUserFindAllParams = Partial<{
  search?: string;
  is_owner?: boolean;
  tenant_id: Types.ObjectId;
  status: 'ACTIVE' | 'INACTIVE';
  page?: number;
  limit?: number;
}>;
