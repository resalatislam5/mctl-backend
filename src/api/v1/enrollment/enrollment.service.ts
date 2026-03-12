import { ClientSession, PipelineStage } from 'mongoose';
import { IEnrollmentFindAllParams, IEnrollmentList } from './enrollment.dto';
import { Enrollment } from './enrollment.model';

const findAll = ({ search, student_id }: IEnrollmentFindAllParams) => {
  const query: any = {};

  if (search) {
    query.$or = [{ name: { $regex: search, $options: 'i' } }];
  }
  if (student_id) {
    query.student_id = student_id;
  }

  return Enrollment.find(query);
};

const findOne = ({ key }: { key?: Partial<IEnrollmentList> }) => {
  if (key?._id) {
    return Enrollment.findById(key._id);
  }

  return Enrollment.findOne(key);
};

const create = ({
  additional_discount,
  admission_date,
  batch_id,
  course_mode,
  courses,
  discount,
  installment_date,
  student_id,
  total_price,
  total_amount,
  total_paid,
  code,
  course_type,
  package_id,
  course_ids,
  agent_id,
  installment_type,
}: IEnrollmentList) => {
  const pkg = new Enrollment({
    additional_discount,
    admission_date,
    batch_id,
    course_mode,
    courses,
    discount,
    installment_date,
    student_id,
    total_price,
    total_amount,
    total_paid,
    code,
    course_type,
    package_id,
    course_ids,
    agent_id,
    installment_type,
  });
  return pkg.save();
};

const update = (
  _id: string,
  data: Partial<IEnrollmentList>,
  session?: ClientSession | null,
) => {
  return Enrollment.findByIdAndUpdate(_id, data, {
    returnDocument: 'after',
    runValidators: true,
    ...(session && { session }),
  });
};

const deleteItem = (_id: string) => {
  return Enrollment.findByIdAndDelete(_id);
};

const count = ({ search }: IEnrollmentFindAllParams) => {
  const query: any = {};

  // name filter

  // search filter
  if (search) {
    query.$or = [{ name: { $regex: search, $options: 'i' } }];
  }

  return Enrollment.countDocuments(query);
};

const aggregate = (pipeline: PipelineStage[]) => {
  return Enrollment.aggregate(pipeline);
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
