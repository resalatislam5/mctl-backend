import { ClientSession, Types } from 'mongoose';
import Counter from './counter.modal';

export const generateCode = async (
  name:
    | 'enrollment'
    | 'money_receipt'
    | 'expense_history'
    | 'balance_transfer'
    | 'agent_payment',
  prefix: 'ENR' | 'MR' | 'EXP' | 'BT' | 'ANR',
  session?: ClientSession | null,
  tenant_id?: Types.ObjectId,
) => {
  if (!tenant_id) throw new Error('tenant_id is required');

  const counter = await Counter.findOneAndUpdate(
    { name, tenant_id },
    { $inc: { seq: 1 } },
    {
      returnDocument: 'after',
      runValidators: true,
      upsert: true,
      ...(session && { session }),
    },
  );

  if (!counter) {
    throw new Error('Failed to generate counter');
  }

  const number = String(counter.seq).padStart(4, '0');

  return `${prefix}-${number}`;
};
