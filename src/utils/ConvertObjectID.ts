// import mongoose, { Mongoose, Types } from 'mongoose';
// import { customError } from './customError';

// export const convertObjectID = (
//   _id: string | undefined | Types.ObjectId,
// ): Types.ObjectId => {
//   if (!_id) customError('Id is required', 400);

//   return new mongoose.Types.ObjectId(_id);
// };

import mongoose, { Types } from 'mongoose';
import { customError } from './customError';

export const convertObjectID = (
  _id: string | Types.ObjectId | undefined,
): Types.ObjectId => {
  if (!_id) {
    throw customError('Id is required', 400);
  }

  // If already ObjectId → return directly
  if (_id instanceof Types.ObjectId) {
    return _id;
  }

  // Validate properly
  if (!Types.ObjectId.isValid(_id) || String(new Types.ObjectId(_id)) !== _id) {
    throw customError('Invalid ObjectId', 400);
  }

  return new mongoose.Types.ObjectId(_id);
};
