import { model, Schema } from 'mongoose';
import { ICreateDistrict } from './district.dto';

const DistrictSchema = new Schema<ICreateDistrict>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      indexes: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      indexes: true,
    },
    division_id: {
      type: Schema.Types.ObjectId,
      ref: 'Division',
      required: true,
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

const District = model('District', DistrictSchema);
export default District;
