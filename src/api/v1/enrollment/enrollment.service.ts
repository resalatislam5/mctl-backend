import { ClientSession, PipelineStage, Types } from 'mongoose';
import { IEnrollmentFindAllParams, IEnrollmentList } from './enrollment.dto';
import { Enrollment } from './enrollment.model';

const findAll = ({
  search,
  student_id,
  installment_date,
  batch_id,
  agent_id,
  tenant_id,
}: IEnrollmentFindAllParams) => {
  const query: any = { tenant_id };

  if (search) {
    query.$or = [{ name: { $regex: search, $options: 'i' } }];
  }
  if (student_id) {
    query.student_id = student_id;
  }
  if (agent_id) {
    query.agent_id = agent_id;
  }
  if (batch_id) {
    query.batch_id = batch_id;
  }
  if (installment_date) {
    query.installment_date = installment_date;
  }

  return Enrollment.find(query);
};

const findOne = (key: Partial<IEnrollmentList>) => {
  if (key?._id) {
    return Enrollment.findById(key._id);
  }

  return Enrollment.findOne(key);
};

const create = (
  {
    additional_discount,
    admission_date,
    batch_id,
    course_mode,
    discount,
    installments,
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
    meal_accommodation,
    tenant_id,
    status,
  }: IEnrollmentList,
  session: ClientSession | null,
) => {
  const data = new Enrollment({
    additional_discount,
    admission_date,
    batch_id,
    course_mode,
    discount,
    installments,
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
    meal_accommodation,
    tenant_id,
    status,
  });
  return data.save({ ...(session && { session }) });
};

const update = ({
  _id,
  tenant_id,
  data,
  session,
}: {
  tenant_id: Types.ObjectId;
  _id: Types.ObjectId;
  data: Partial<IEnrollmentList>;
  session?: ClientSession | null;
}) => {
  return Enrollment.findOneAndUpdate({ _id, tenant_id }, data, {
    returnDocument: 'after',
    runValidators: true,
    ...(session && { session }),
  });
};

const deleteItem = ({
  _id,
  tenant_id,
}: {
  _id: Types.ObjectId;
  tenant_id: Types.ObjectId;
}) => {
  return Enrollment.findOneAndDelete({ _id, tenant_id });
};

const count = ({
  search,
  student_id,
  agent_id,
  batch_id,
  installment_date,
  tenant_id,
}: IEnrollmentFindAllParams) => {
  const query: any = { tenant_id };

  if (search) {
    query.$or = [{ name: { $regex: search, $options: 'i' } }];
  }
  if (student_id) {
    query.student_id = student_id;
  }
  if (agent_id) {
    query.agent_id = agent_id;
  }
  if (batch_id) {
    query.batch_id = batch_id;
  }
  if (installment_date) {
    query.installment_date = installment_date;
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
