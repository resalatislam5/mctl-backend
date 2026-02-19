import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { IUser } from '../api/v1/user/user.model';
import userService from '../api/v1/user/user.service';
import { RequestWithUser } from '../types/commonTypes';
import { customError } from '../utils/customError';
export const authenticate = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer'))
      customError('No valid authentication token provide', 401);

    const token = authHeader?.substring(7);
    let decoded = jwt.verify(
      token as string,
      process.env.JTW_PASSWORD as string,
    ) as IUser;
    if (decoded) {
      const user = await userService
        .findOne({ email: decoded.email || '' })
        .populate('role_id');
      if (!user) customError('No valid authentication token provide', 401);

      req.user = user;
      next();
    } else {
      customError('You are unauthorize', 401);
    }
  } catch (err) {
    customError('You are unauthorize', 401);
  }
};
