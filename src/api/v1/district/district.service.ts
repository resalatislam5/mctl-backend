import { IDistrictList } from './district.dto';
import District from './district.model';

type findAllParams = {
  search?: string;
  country_id?: string;
  division_id?: string;
};
const findAll = ({ search = '', country_id, division_id }: findAllParams) => {
  const query: any = {};

  // country_id filter
  if (country_id) {
    query.country_id = country_id;
  }
  if (division_id) {
    query.division_id = division_id;
  }

  // search filter
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } },
    ];
  }

  return District.find(query);
};

const findOne = ({ key }: { key?: Partial<IDistrictList> }) => {
  if (key?._id) {
    return District.findById(key._id);
  }

  return District.findOne(key);
};

const create = ({ name, code, division_id, status }: IDistrictList) => {
  const district = new District({
    name,
    code,
    division_id,
    status,
  });
  return district.save();
};

const update = (_id: string, data: Partial<IDistrictList>) => {
  return District.findByIdAndUpdate(_id, data, { new: true });
};

const deleteItem = (_id: string) => {
  return District.findByIdAndDelete(_id);
};

const count = ({ search, country_id, division_id }: findAllParams) => {
  const query: any = {};

  // country_id filter
  if (country_id) {
    query.country_id = country_id;
  }
  if (division_id) {
    query.division_id = division_id;
  }
  // search filter
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } },
    ];
  }

  return District.countDocuments(query);
};

export default { findAll, findOne, create, update, deleteItem, count };
