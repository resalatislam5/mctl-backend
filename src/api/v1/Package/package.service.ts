import { IPackageFindAllParams, IPackageList } from './package.dto';
import Package from './package.model';

const findAll = ({ search, status }: IPackageFindAllParams) => {
  const query: any = {};

  if (search) {
    query.$or = [{ name: { $regex: search, $options: 'i' } }];
  }

  if (status) {
    query.status = status;
  }
  return Package.find(query);
};

const findOne = ({ key }: { key?: Partial<IPackageList> }) => {
  if (key?._id) {
    return Package.findById(key._id);
  }

  return Package.findOne(key);
};

const create = ({
  name,
  course_ids,
  total_price,
  net_price,
  discount,
  additional_discount,
  status,
}: IPackageList) => {
  const pkg = new Package({
    name,
    course_ids,
    total_price,
    net_price,
    discount,
    additional_discount,
    status,
  });
  return pkg.save();
};

const update = (_id: string, data: Partial<IPackageList>) => {
  return Package.findByIdAndUpdate(_id, data, { new: true });
};

const deleteItem = (_id: string) => {
  return Package.findByIdAndDelete(_id);
};

const count = ({ search, status }: IPackageFindAllParams) => {
  const query: any = {};

  // name filter
  if (status) {
    query.status = status;
  }
  // search filter
  if (search) {
    query.$or = [{ name: { $regex: search, $options: 'i' } }];
  }

  if (status) {
    query.status = status;
  }

  return Package.countDocuments(query);
};

export default { findAll, findOne, create, update, deleteItem, count };
