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
