import mongoose, { model, Schema } from 'mongoose';
import { ICreatePackage } from './package.dto';

const PackageSchema = new Schema<ICreatePackage>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      indexes: true,
    },
    course_ids: {
      type: [mongoose.Types.ObjectId],
      required: true,
    },
    total_price: {
      type: Number,
      required: true,
      trim: true,
      indexes: true,
    },
    net_price: {
      type: Number,
      required: true,
      trim: true,
      indexes: true,
    },
    discount: {
      type: Number,
      required: true,
      trim: true,
    },
    additional_discount: {
      type: Number,
      required: true,
      trim: true,
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

const Package = model('Package', PackageSchema);
export default Package;
