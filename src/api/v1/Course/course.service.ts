import { ICourseFindAllParams, ICourseList } from './course.dto';
import Course from './course.model';

const findAll = ({ search, status }: ICourseFindAllParams) => {
  const query: any = {};

  if (search) {
    query.$or = [{ name: { $regex: search, $options: 'i' } }];
  }

  if (status) {
    query.status = status;
  }
  return Course.find(query);
};

const findOne = ({ key }: { key?: Partial<ICourseList> }) => {
  if (key?._id) {
    return Course.findById(key._id);
  }

  return Course.findOne(key);
};

const create = ({ name, price, status }: ICourseList) => {
  const course = new Course({ name, price, status });
  return course.save();
};

const update = (_id: string, data: Partial<ICourseList>) => {
  return Course.findByIdAndUpdate(_id, data, { new: true });
};

const deleteItem = (_id: string) => {
  return Course.findByIdAndDelete(_id);
};

const count = ({ search, status }: ICourseFindAllParams) => {
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

  return Course.countDocuments(query);
};

export default { findAll, findOne, create, update, deleteItem, count };
