import { createCountryTypes, ICountryFindAllParams } from './country.dto';
import Country, { CountryType } from './country.model';

const findAll = ({ search, status }: ICountryFindAllParams) => {
  const query: any = {};
  if (status) {
    query.status = status;
  }
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } },
    ];
  }
  return Country.find(query);
};

const findOne = ({ key }: { key?: Partial<CountryType> }) => {
  if (key?._id) {
    return Country.findById(key._id);
  }

  return Country.findOne(key);
};

const create = ({ name, code }: createCountryTypes) => {
  const country = new Country({ name, code });
  return country.save();
};

const update = (_id: string, data: Partial<CountryType>) => {
  return Country.findByIdAndUpdate(_id, data, { new: true });
};

const deleteItem = (_id: string) => {
  return Country.findByIdAndDelete(_id);
};

const count = ({ search, status }: ICountryFindAllParams) => {
  const query: any = {};

  // search filter
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } },
    ];
  }

  if (status) {
    query.status = status;
  }
  return Country.countDocuments(query);
};

export default { findAll, findOne, create, update, deleteItem, count };
