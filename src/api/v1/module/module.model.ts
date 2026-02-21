import { model, Schema } from 'mongoose';
import { ICreateModule } from './module.dto';

const ModuleSchema = new Schema<ICreateModule>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      indexes: true,
    },
    label: {
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

const Module = model('Module', ModuleSchema);
export default Module;
