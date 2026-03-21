import { model, Schema, Types } from 'mongoose';
import { ICreateAccountTransaction } from './accountTransaction.dto';

const AccountTransactionSchema = new Schema<ICreateAccountTransaction>(
  {
    account_id: { type: Types.ObjectId, required: true, ref: 'Account' },
    money_receipt_id: {
      type: Types.ObjectId,
      ref: 'MoneyReceipt',
      default: null,
    },
    agent_id: { type: Types.ObjectId, ref: 'Agent', default: null },
    expense_id: {
      type: Types.ObjectId,
      ref: 'ExpenseHistory',
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
