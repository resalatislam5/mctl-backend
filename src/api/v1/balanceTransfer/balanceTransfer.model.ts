import { model, Schema, Types } from 'mongoose';
import { ICreateBalanceTransfer } from './balanceTransfer.dto';

const BalanceTransferSchema = new Schema<ICreateBalanceTransfer>(
  {
    from_acc_id: {
      type: Types.ObjectId,
      schema: 'accounts',
      required: true,
    },
    to_acc_id: {
      type: Types.ObjectId,
      schema: 'accounts',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    date: { type: String, trim: true, require: true },
    note: { type: String, trim: true },
    voucher_no: { type: String, trim: true },
  },
  { timestamps: true },
);

export const BalanceTransfer = model('BalanceTransfer', BalanceTransferSchema);
