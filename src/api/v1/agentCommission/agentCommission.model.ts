import { model, Schema, Types } from 'mongoose';
import { ICreateAgentCommission } from './agentCommission.dto';

const AgentCommissionSchema = new Schema<ICreateAgentCommission>(
  {
    agent_id: {
      type: Types.ObjectId,
      required: true,
      ref: 'Agent',
      index: true,
    },
    batch_id: {
      type: Types.ObjectId,
      required: true,
      ref: 'Batch',
      index: true,
    },
    total_students: {
      type: Number,
      required: true,
      trim: true,
      default: 0,
    },
    eligible_students: {
      type: Number,
      required: true,
      trim: true,
      default: 0,
    },
    total_amount: {
      type: Number,
      required: true,
      trim: true,
      default: 0,
    },
    commission_rate: {
      type: Number,
      required: true,
      trim: true,
      default: 0,
    },
    commission_amount: {
      type: Number,
      trim: true,
      default: 0,
    },
    paid_amount: {
      type: Number,
      trim: true,
      default: 0,
    },

    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'PAID'],
      trim: true,
      default: 'PENDING',
    },
  },
  {
    timestamps: true,
  },
).index({ agent_id: 1, batch_id: 1 }, { unique: true });

const AgentCommission = model('AgentCommission', AgentCommissionSchema);
export default AgentCommission;
