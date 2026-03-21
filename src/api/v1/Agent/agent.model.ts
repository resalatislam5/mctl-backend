import { model, Schema } from 'mongoose';
import { ICreateAgent } from './agent.dto';

const AgentSchema = new Schema<ICreateAgent>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      indexes: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      indexes: true,
      unique: true,
    },
    mobile_no: {
      type: String,
      required: true,
      trim: true,
      indexes: true,
    },
    min_limit: {
      type: Number,
      required: true,
      trim: true,
    },
    commission: {
      type: Number,
      required: true,
      trim: true,
    },
    min_payment_percent: {
      type: String,
      trim: true,
      default: '0',
    },

    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      trim: true,
      default: 'ACTIVE',
    },
  },
  {
    timestamps: true,
  },
);

const Agent = model('Agent', AgentSchema);
export default Agent;
