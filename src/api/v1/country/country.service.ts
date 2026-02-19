import { createCountryTypes } from './country.dto';
import Country, { CountryType } from './country.model';

const findAll = async ({ search = '' }: { search?: string }) => {
  return await Country.find({
    $or: [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } },
    ],
  });
};

const findOne = async ({ key }: { key?: Partial<CountryType> }) => {
  if (key?._id) {
    return await Country.findById(key._id);
  }

  return await Country.findOne(key);
};

const create = async ({ name, code }: createCountryTypes) => {
  const country = new Country({ name, code });
  return await country.save();
};
const update = async () => {};

export default { findAll, findOne, create, update };
