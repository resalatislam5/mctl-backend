import { Types } from 'mongoose';
import { ICourseFindAllParams, ICourseList } from './course.dto';
import Course from './course.model';

const findAll = ({ search, status, tenant_id }: ICourseFindAllParams) => {
  const query: any = { tenant_id };

  if (search) {
    query.$or = [{ name: { $regex: search, $options: 'i' } }];
  }

  if (status) {
    query.status = status;
  }
  return Course.find(query);
};

const findOne = (key: Partial<ICourseList>) => {
  return Course.findOne(key);
};

const create = ({ name, price, status, tenant_id }: ICourseList) => {
  const course = new Course({ name, price, status, tenant_id });
  return course.save();
};

const update = ({
  _id,
  data,
  tenant_id,
}: {
  _id: Types.ObjectId;
  data: Partial<ICourseList>;
  tenant_id: Types.ObjectId;
}) => {
  return Course.findOneAndUpdate({ _id, tenant_id }, data, {
    returnDocument: 'after',
    runValidators: true,
  });
};

const deleteItem = ({
  _id,
  tenant_id,
}: {
  _id: Types.ObjectId;
  tenant_id: Types.ObjectId;
}) => {
  return Course.findOneAndDelete({ _id, tenant_id });
};

const count = ({ search, status, tenant_id }: ICourseFindAllParams) => {
  const query: any = { tenant_id };

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

  return Course.countDocuments(query);
};

export default { findAll, findOne, create, update, deleteItem, count };
