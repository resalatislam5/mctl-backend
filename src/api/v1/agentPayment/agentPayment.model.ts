import { model, Schema, Types } from 'mongoose';
import { ICreateAgentPayment } from './agentPayment.dto';

const AgentPaymentSchema = new Schema<ICreateAgentPayment>(
  {
    agent_id: {
      type: Types.ObjectId,
      required: true,
      trim: true,
      schema: 'Agent',
    },
    commission_id: {
      type: Types.ObjectId,
      required: true,
      trim: true,
      schema: 'AgentCommission',
    },
    tenant_id: {
      type: Types.ObjectId,
      required: true,
      trim: true,
      schema: 'Tenant',
    },
    voucher_no: {
      type: String,
      required: true,
      trim: true,
    },
    payment_method: {
      type: String,
      required: true,
      enum: ['CASH', 'BANK', 'MOBILE_BANKING'],
    },
    acc_id: {
      type: Types.ObjectId,
      required: true,
      trim: true,
      schema: 'account',
    },
    amount: {
      type: Number,
      trim: true,
      required: true,
    },
    paid_amount: {
      type: Number,
      trim: true,
      default: 0,
    },
    reference_no: {
      type: String,
      trim: true,
    },
    note: {
      type: String,
      trim: true,
    },
    date: {
      type: String,
      trim: true,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const AgentPayment = model('AgentPayment', AgentPaymentSchema);
export default AgentPayment;
