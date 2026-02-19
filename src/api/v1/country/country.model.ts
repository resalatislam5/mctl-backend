import { model, Schema } from 'mongoose';

export type CountryType = {
  _id: string;
  name: string;
  code: string;
};
const CountrySchema = new Schema<CountryType>({
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
});

const Country = model('Country', CountrySchema);
export default Country;
