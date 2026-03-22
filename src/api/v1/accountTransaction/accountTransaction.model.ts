import { model, Schema, Types } from 'mongoose';
import { ICreateAccountTransaction } from './accountTransaction.dto';

const AccountTransactionSchema = new Schema<ICreateAccountTransaction>(
  {
    account_id: { type: Types.ObjectId, required: true, ref: 'Account' },
    voucher_no: { type: String, required: true },
    reference_type: {
      type: String,
      enum: ['MoneyReceipt', 'Agent', 'ExpenseHistory'],
      default: null,
    },
    reference_id: {
      type: Types.ObjectId,
      refPath: 'reference_type',
      default: null,
    },

    type: { type: String, enum: ['CREDIT', 'DEBIT'], required: true },
    amount: { type: String, required: true },
    charge: { type: String, default: '0' },
    description: { type: String, trim: true },
    date: { type: Date, default: Date.now },
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
