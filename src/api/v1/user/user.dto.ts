export interface ICreateUser {
  name: string;
  email: string;
  password: string;
  role_id: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export type IUserFindAllParams = Partial<{
  search?: string;
  status: 'ACTIVE' | 'INACTIVE';
  page?: number;
  limit?: number;
}>;
