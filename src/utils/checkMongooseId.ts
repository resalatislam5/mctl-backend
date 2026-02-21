import mongoose from 'mongoose';
import { customError } from './customError';

export const checkMongooseId = (_id: string | undefined) => {
  if (!_id) customError('Id is required', 400);
  if (!mongoose.Types.ObjectId.isValid(_id as string))
    customError('Invalid Id', 400);
};
