import { IUpazilaFindAllParams, IUpazilaList } from './upazila.dto';
import Upazila from './upazila.model';

const findAll = ({
  search = '',
  district_id,
  status,
}: IUpazilaFindAllParams) => {
  const query: any = {};

  // district_id filter
  if (district_id) {
    query.district_id = district_id;
  }
  if (status) {
    query.status = status;
  }
  // search filter
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } },
    ];
  }

  return Upazila.find(query);
};

const findOne = ({ key }: { key?: Partial<IUpazilaList> }) => {
  if (key?._id) {
    return Upazila.findById(key._id);
  }

  return Upazila.findOne(key);
};

const create = ({ name, code, district_id, status }: IUpazilaList) => {
  const data = new Upazila({ name, code, district_id, status });
  return data.save();
};

const update = (_id: string, data: Partial<IUpazilaList>) => {
  return Upazila.findByIdAndUpdate(_id, data, { new: true });
};

const deleteItem = (_id: string) => {
  return Upazila.findByIdAndDelete(_id);
};

const count = ({ search, district_id, status }: IUpazilaFindAllParams) => {
  const query: any = {};

  // district_id filter
  if (district_id) {
    query.district_id = district_id;
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

  return Upazila.countDocuments(query);
};

export default { findAll, findOne, create, update, deleteItem, count };
