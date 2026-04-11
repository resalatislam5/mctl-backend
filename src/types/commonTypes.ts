import { Request } from 'express';

export type paginationQueryTypes = Partial<{
  limit: number | string;
  page: number | string;
}>;

export interface RequestWithUser extends Request {
  user?: any;
}

export interface IParams {
  _id?: string;
}

export type IGender = 'MALE' | 'FEMALE' | 'OTHER';

export type IStatus = 'ACTIVE' | 'INACTIVE';
export type IPaymentMethod = 'CASH' | 'BANK' | 'MOBILE_BANKING';
