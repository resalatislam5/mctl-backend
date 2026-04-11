import { ITenantFindAllParams, ITenantList } from './tenant.dto';
import Tenant from './tenant.model';

const findAll = ({ search, status }: ITenantFindAllParams) => {
  const query: any = {};

  if (search) {
    query.$or = [{ name: { $regex: search, $options: 'i' } }];
  }
  if (status) {
    query.status = status;
  }
  return Tenant.find(query);
};

const findOne = ({ key }: { key?: Partial<ITenantList> }) => {
  if (key?._id) {
    return Tenant.findById(key._id);
  }

  return Tenant.findOne(key);
};

const create = ({ name, email, status }: ITenantList) => {
  const data = new Tenant({ name, email, status });
  return data.save();
};

const update = (_id: string, data: Partial<ITenantList>) => {
  return Tenant.findByIdAndUpdate(_id, data, { new: true });
};

const deleteItem = (_id: string) => {
  return Tenant.findByIdAndDelete(_id);
};

const count = ({ search, status }: ITenantFindAllParams) => {
  const query: any = {};

  // batch_no filter
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

  return Tenant.countDocuments(query);
};

export default { findAll, findOne, create, update, deleteItem, count };
