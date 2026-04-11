import { model, Schema, Types } from 'mongoose';

export type CounterType = {
  name:
    | 'enrollment'
    | 'money_receipt'
    | 'expense_history'
    | 'balance_transfer'
    | 'agent_payment';
  tenant_id: Types.ObjectId;
  seq: number;
};

const CounterSchema = new Schema<CounterType>({
  name: {
    type: String,
    enum: [
      'enrollment',
      'money_receipt',
      'expense_history',
      'balance_transfer',
      'agent_payment',
    ],
    required: true,
  },
  tenant_id: {
    type: Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true,
  },
  seq: {
    type: Number,
    default: 0,
  },
});

const Counter = model<CounterType>('Counter', CounterSchema);

export default Counter;
