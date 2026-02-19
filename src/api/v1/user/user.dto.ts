export interface ICreateUser {
  name: string;
  email: string;
  password: string;
  role_id: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export type userQuery = Partial<{
  name?: string;
  email?: string;
  page?: number;
  limit?: number;
}>;
