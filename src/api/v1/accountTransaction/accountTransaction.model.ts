import { model, Schema, Types } from 'mongoose';
import { ICreateAccountTransaction } from './accountTransaction.dto';

const AccountTransactionSchema = new Schema<ICreateAccountTransaction>(
  {
    account_id: { type: Types.ObjectId, required: true, ref: 'Account' },
    voucher_no: { type: String, required: true },
    reference_type: {
      type: String,
      enum: [
        'MoneyReceipt',
        'Agent',
        'ExpenseHistory',
        'Account',
        'AgentPayment',
        'BalanceTransfer',
      ],
      default: null,
    },
    reference_id: {
      type: Types.ObjectId,
      refPath: 'reference_type',
      default: null,
    },
    tenant_id: {
      type: Types.ObjectId,
      required: true,
      ref: 'tenant',
    },

    type: { type: String, enum: ['CREDIT', 'DEBIT'], required: true },
    amount: { type: Number, required: true },
    description: { type: String, trim: true },
    date: { type: Date, default: Date.now },
    is_balance_transfer: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

const AccountTransaction = model(
  'AccountTransaction',
  AccountTransactionSchema,
);
export default AccountTransaction;
