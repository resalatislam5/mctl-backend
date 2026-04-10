export interface ICreateUser {
  name: string;
  email: string;
  password: string;
  role_id: string;
  is_owner?: boolean;
  status: 'ACTIVE' | 'INACTIVE';
}

export type IUserFindAllParams = Partial<{
  search?: string;
  is_owner?: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  page?: number;
  limit?: number;
}>;
