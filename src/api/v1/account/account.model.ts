import { model, Schema } from 'mongoose';
import { ICreateAccount } from './account.dto';

const AccountSchema = new Schema<ICreateAccount>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      indexes: true,
    },
    account_type: {
      type: String,
      required: true,
      trim: true,
    },
    acc_number: {
      type: String,
      trim: true,
    },
    bank_name: {
      type: String,
      trim: true,
    },
    branch_name: {
      type: String,
      trim: true,
    },
    opening_balance: {
      type: String,
      trim: true,
      default: '0',
    },
    available_balance: {
      type: String,
      trim: true,
      default: '0',
    },
    charge_percent: {
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

const Account = model('Account', AccountSchema);
export default Account;
