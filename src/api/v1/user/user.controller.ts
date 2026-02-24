import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { RequestWithUser } from '../../../types/commonTypes';
import { customError } from '../../../utils/customError';
import { ICreateUser } from './user.dto';
import userService from './user.service';

const findAll = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  const search = req.query.search?.toString() || '';
  const limit = Number(req.query.limit || 100);
  const skip = Number(req.query.skip || 0);
  const status = req.query.status?.toString() as 'ACTIVE' | 'INACTIVE';
  try {
    const [data, total] = await Promise.all([
      userService
        .findAll({ search, status })
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 })
        .select('_id name email role_id status createdAt updatedAt'),
      userService.count({ search, status }),
    ]);

    res.json({ success: true, total, data });
  } catch (err) {
    next(err);
  }
};

const findOne = async (req: Request, res: Response, next: NextFunction) => {
  const { _id } = req.params;
  try {
    if (!_id || Array.isArray(_id) || !mongoose.Types.ObjectId.isValid(_id)) {
      return customError('Invalid id', 400);
    }

    const user = await userService.findOne({ _id });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

const create = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, role_id, status } = req.body as ICreateUser;

  const findUser = await userService.findOne({ email });
  if (findUser) customError('User already exit', 409);

  try {
    await userService.create({
      name,
      email,
      role_id,
      password,
      status,
    });

    res
      .status(201)
      .json({ success: true, message: 'User Create Successfully' });
  } catch (err) {
    next(err);
  }
};

const update = async (req: Request, res: Response, next: NextFunction) => {
  const { _id } = req.params;

  const { name, email, password, role_id, status } = req.body as ICreateUser;

  try {
    if (!_id || Array.isArray(_id) || !mongoose.Types.ObjectId.isValid(_id)) {
      return customError('Invalid id', 400);
    }
    const findUser = await userService.findOne({ email });
    if (!findUser) customError('User Not Found', 404);

    await userService.update(_id, {
      name,
      email,
      role_id,
      password,
      status,
    });
    // delete user.password;
    res
      .status(200)
      .json({ success: true, message: 'User update Successfully' });
  } catch (err) {
    next(err);
  }
};
const deleteOne = async (req: Request, res: Response, next: NextFunction) => {
  const { _id } = req.params;

  try {
    if (!_id || Array.isArray(_id) || !mongoose.Types.ObjectId.isValid(_id)) {
      return customError('Invalid id', 400);
    }

    await userService.deleteOne(_id);
    res.status(200).json({ success: true, message: 'Delete Successfully' });
  } catch (err) {
    next(err);
  }
};

const select = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  // const { name, email, limit, page } = req.query as userQuery;
  // console.log('req.user', req?.user);

  try {
    const users = await userService.findAll({}).select('name email _id');
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

export default { findAll, create, deleteOne, findOne, update, select };
