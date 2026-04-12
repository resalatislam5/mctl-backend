import { PipelineStage, Types } from 'mongoose';
import { IStudentFindAllParams, IStudentList } from './student.dto';
import { Student } from './student.model';

const findAll = ({
  search,
  status,
  student_id,
  tenant_id,
}: IStudentFindAllParams) => {
  const query: any = { tenant_id };

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

const findOne = (key: Partial<IStudentList>) => {
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
  tenant_id,
}: IStudentList) => {
  const data = new Student({
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
    tenant_id,
  });
  return data.save();
};

const update = ({
  _id,
  tenant_id,
  data,
}: {
  _id: Types.ObjectId;
  tenant_id: Types.ObjectId;
  data: Partial<IStudentList>;
}) => {
  return Student.findOneAndUpdate({ _id, tenant_id }, data, { new: true });
};

const deleteItem = ({
  _id,
  tenant_id,
}: {
  _id: Types.ObjectId;
  tenant_id: Types.ObjectId;
}) => {
  return Student.findOneAndDelete({ _id, tenant_id });
};

const count = ({ search, status, tenant_id }: IStudentFindAllParams) => {
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
