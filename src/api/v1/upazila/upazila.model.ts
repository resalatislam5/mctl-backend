import { model, Schema } from 'mongoose';
import { ICreateUpazila } from './upazila.dto';

const UpazilaSchema = new Schema<ICreateUpazila>(
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
    district_id: {
      type: Schema.Types.ObjectId,
      ref: 'District',
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

const Upazila = model('Upazila', UpazilaSchema);
export default Upazila;
