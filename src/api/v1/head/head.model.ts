import { model, Schema, Types } from 'mongoose';
import { ICreateHead } from './head.dto';

const HeadSchema = new Schema<ICreateHead>(
  {
    name: { type: String, trim: true, require: true },
    tenant_id: { type: Types.ObjectId, required: true },
  },

  { timestamps: true },
);

export const Head = model('Head', HeadSchema);
