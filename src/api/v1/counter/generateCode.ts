import { ClientSession } from 'mongoose';
import Counter from './counter.modal';

export const generateCode = async (
  name: 'enrollment' | 'money_receipt' | 'expense_history' | 'balance_transfer',
  prefix: 'ENR' | 'MR' | 'EXP' | 'BT',
  session?: ClientSession | null,
) => {
  const counter = await Counter.findOneAndUpdate(
    { name },
    { $inc: { seq: 1 } },
    {
      returnDocument: 'after',
      runValidators: true,
      upsert: true,
      ...(session && { session }),
    },
  );

  const number = String(counter.seq).padStart(4, '0');

  return `${prefix}-${number}`;
};
