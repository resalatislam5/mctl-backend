import { IDivisionFindAllParams, IDivisionList } from './division.dto';
import Division from './division.model';

const findAll = ({ search, country_id, status }: IDivisionFindAllParams) => {
  const query: any = {};

  // country_id filter
  if (country_id) {
    query.country_id = country_id;
  }

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
  return Division.find(query);
};

const findOne = ({ key }: { key?: Partial<IDivisionList> }) => {
  if (key?._id) {
    return Division.findById(key._id);
  }

  return Division.findOne(key);
};

const create = ({ name, code, country_id, status }: IDivisionList) => {
  const division = new Division({ name, code, country_id, status });
  return division.save();
};

const update = (_id: string, data: Partial<IDivisionList>) => {
  return Division.findByIdAndUpdate(_id, data, { new: true });
};

const deleteItem = (_id: string) => {
  return Division.findByIdAndDelete(_id);
};

const count = ({ search, country_id }: IDivisionFindAllParams) => {
  const query: any = {};

  // country_id filter
  if (country_id) {
    query.country_id = country_id;
  }
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

  return Division.countDocuments(query);
};

export default { findAll, findOne, create, update, deleteItem, count };
