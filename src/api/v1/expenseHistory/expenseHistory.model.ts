import { model, Schema, Types } from 'mongoose';
import { ICreateExpenseHistory } from './expenseHistory.dto';

const ExpenseHistorySchema = new Schema<ICreateExpenseHistory>(
  {
    expense_details: [
      {
        _id: false,
        head_id: {
          type: Types.ObjectId,
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
      },
    ],
    account_type: {
      type: String,
      trim: true,
      require: true,
      enum: ['CASH', 'BANK', 'MOBILE_BANKING'],
    },
    acc_id: {
      type: Types.ObjectId,
      required: true,
      schema: 'account',
    },
    total_amount: {
      type: Number,
      trim: true,
      required: true,
    },
    date: {
      type: String,
      trim: true,
      required: true,
    },
    voucher_no: {
      type: String,
      trim: true,
      required: true,
    },
    note: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

export const ExpenseHistory = model('ExpenseHistory', ExpenseHistorySchema);
