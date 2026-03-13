import { model, Schema } from 'mongoose';
import { ICreateHead } from './head.dto';

const HeadSchema = new Schema<ICreateHead>(
  {
    name: { type: String, trim: true, require: true },
  },
  { timestamps: true },
);

export const Head = model('Head', HeadSchema);
