import { model, Schema } from 'mongoose';

export type CounterType = {
  name: 'enrollment';
  seq: number;
};

const CounterSchema = new Schema<CounterType>({
  name: {
    type: String,
    enum: ['enrollment'],
    required: true,
    unique: true,
  },
  seq: {
    type: Number,
    default: 0,
  },
});

const Counter = model<CounterType>('Counter', CounterSchema);

export default Counter;
