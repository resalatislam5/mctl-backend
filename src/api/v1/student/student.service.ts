import { PipelineStage } from 'mongoose';
import { IStudentFindAllParams, IStudentList } from './student.dto';
import { Student } from './student.model';

const findAll = ({ search, status, student_id }: IStudentFindAllParams) => {
  const query: any = {};

  if (search) {
    query.$or = [{ name: { $regex: search, $options: 'i' } }];
  }

  if (status) {
    query.status = status;
  }
  if (student_id) {
    query._id = student_id;
  }
  return Student.find(query);
};

const findOne = ({ key }: { key?: Partial<IStudentList> }) => {
  if (key?._id) {
    return Student.findById(key._id);
  }

  return Student.findOne(key);
};

const create = ({
  name,
  co_mobile,
  mobile_no,
  code,
  country_id,
  division_id,
  district_id,
  dob,
  education,
  email,
  gender,
  image,
  nationality,
  nid_no,
  occupation,
  office_address,
  upazila_id,
  relationship,
  village,
  image_public_id,
  status,
}: IStudentList) => {
  const pkg = new Student({
    name,
    co_mobile,
    mobile_no,
    code,
    country_id,
    division_id,
    district_id,
    dob,
    education,
    email,
    gender,
    image,
    nationality,
    nid_no,
    occupation,
    office_address,
    upazila_id,
    relationship,
    village,
    image_public_id,
    status,
  });
  return pkg.save();
};

const update = (_id: string, data: Partial<IStudentList>) => {
  return Student.findByIdAndUpdate(_id, data, { new: true });
};

const deleteItem = (_id: string) => {
  return Student.findByIdAndDelete(_id);
};

const count = ({ search, status }: IStudentFindAllParams) => {
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

  return Student.countDocuments(query);
};

const aggregate = (pipeline: PipelineStage[]) => {
  return Student.aggregate(pipeline);
};
export default {
  findAll,
  findOne,
  create,
  update,
  deleteItem,
  count,
  aggregate,
};
