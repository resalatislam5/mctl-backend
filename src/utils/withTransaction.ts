import mongoose, { ClientSession } from 'mongoose';

export const withTransaction = async <T>(
  callback: (session: ClientSession | null) => Promise<T>,
): Promise<T> => {
  let session: ClientSession | null = null;

  try {
    if (mongoose.connection.readyState === 1) {
      try {
        session = await mongoose.startSession();
        session.startTransaction();
      } catch {
        // standalone MongoDB, transactions not supported
        session = null;
      }
    }

    const result = await callback(session);

    if (session) await session.commitTransaction();

    return result;
  } catch (err) {
    if (session) await session.abortTransaction();
    throw err;
  } finally {
    if (session) session.endSession();
  }
};
