import { model, Schema, Types } from 'mongoose';

export type CountryType = {
  _id: Types.ObjectId;
  name: string;
  code: string;
  status: 'ACTIVE' | 'INACTIVE';
};
const CountrySchema = new Schema<CountryType>(
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

const Country = model('Country', CountrySchema);
export default Country;
