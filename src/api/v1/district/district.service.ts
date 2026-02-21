import { IDistrictFindAllParams, IDistrictList } from './district.dto';
import District from './district.model';

const findAll = ({
  search = '',
  division_id,
  status,
}: IDistrictFindAllParams) => {
  const query: any = {};

  // country_id filter
  if (status) {
    query.status = status;
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

const count = ({ search, division_id, status }: IDistrictFindAllParams) => {
  const query: any = {};

  if (status) {
    query.status = status;
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
