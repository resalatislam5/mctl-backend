import { Types } from 'mongoose';
import Module from './module.model';

const findAll = ({
  status,
  tenant_id,
}: {
  status: string;
  tenant_id: Types.ObjectId;
}) => {
  let query: any = { tenant_id };
  if (status) {
    query.status = status;
  }
  return Module.find(query);
};

export default { findAll };
