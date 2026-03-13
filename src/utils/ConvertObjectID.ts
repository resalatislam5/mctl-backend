import mongoose, { Mongoose } from 'mongoose';
import { customError } from './customError';

export const convertObjectID = (_id: string | undefined) => {
  if (!_id) customError('Id is required', 400);
  return new mongoose.Types.ObjectId(_id);
};
