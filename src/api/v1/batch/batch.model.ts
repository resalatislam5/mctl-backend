import { model, Schema } from 'mongoose';
import { ICreateBatch } from './batch.dto';

const BatchSchema = new Schema<ICreateBatch>(
  {
    batch_no: {
      type: String,
      required: true,
      trim: true,
      indexes: true,
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

const Batch = model('Batch', BatchSchema);
export default Batch;
