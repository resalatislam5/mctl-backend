import { model, Schema, Types } from 'mongoose';
import { ICreateMoneyReceipt } from './moneyReceipt.dto';

const MoneyReceiptSchema = new Schema<ICreateMoneyReceipt>(
  {
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
    student_id: {
      type: Types.ObjectId,
      required: true,
      trim: true,
      schema: 'student',
    },
    enrollment_id: {
      type: Types.ObjectId,
      trim: true,
      required: true,
      schema: 'enrollment',
    },
    amount: {
      type: String,
      trim: true,
      required: true,
    },
    paid_amount: {
      type: String,
      trim: true,
      default: '0',
    },
    charge: {
      type: String,
      trim: true,
      default: '0',
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

const MoneyReceipt = model('MoneyReceipt', MoneyReceiptSchema);
export default MoneyReceipt;
