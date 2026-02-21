import { model, Schema } from 'mongoose';
import { ICreateDivision } from './division.dto';

const DivisionSchema = new Schema<ICreateDivision>(
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
    country_id: {
      type: Schema.Types.ObjectId,
      ref: 'Country',
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

const Division = model('Division', DivisionSchema);
export default Division;
