import { ClientSession, PipelineStage, Types } from 'mongoose';
import {
  ICourseProgressFindAllParams,
  ICourseProgressList,
} from './courseProgress.dto';
import { CourseProgress } from './courseProgress.model';

const findAll = ({
  search,
  student_id,
  batch_id,
  tenant_id,
}: ICourseProgressFindAllParams) => {
  const query: any = { tenant_id };

  if (search) {
    query.$or = [{ name: { $regex: search, $options: 'i' } }];
  }
  if (student_id) {
    query.student_id = student_id;
  }

  if (batch_id) {
    query.batch_id = batch_id;
  }

  return CourseProgress.find(query);
};

const findOne = (key: Partial<ICourseProgressList>) => {
  if (key?._id) {
    return CourseProgress.findById(key._id);
  }

  return CourseProgress.findOne(key);
};

const create = (
  {
    batch_id,
    courses,
    student_id,
    tenant_id,
    enrollment_id,
  }: ICourseProgressList,
  session?: ClientSession | null,
) => {
  const data = new CourseProgress({
    batch_id,
    courses,
    student_id,
    tenant_id,
    enrollment_id,
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
  data: Partial<ICourseProgressList>;
  session?: ClientSession | null;
}) => {
  return CourseProgress.findOneAndUpdate({ _id, tenant_id }, data, {
    returnDocument: 'after',
    runValidators: true,
    ...(session && { session }),
  });
};

const deleteItem = ({
  _id,
  enrollment_id,
  tenant_id,
}: {
  _id?: Types.ObjectId;
  enrollment_id?: Types.ObjectId;
  tenant_id: Types.ObjectId;
}) => {
  const query: any = { tenant_id };

  if (_id) {
    query._id = _id;
  }
  if (enrollment_id) {
    query.enrollment_id = enrollment_id;
  }
  return CourseProgress.findOneAndDelete(query);
};

const count = ({
  search,
  student_id,
  batch_id,
  tenant_id,
}: ICourseProgressFindAllParams) => {
  const query: any = { tenant_id };

  if (search) {
    query.$or = [{ name: { $regex: search, $options: 'i' } }];
  }
  if (student_id) {
    query.student_id = student_id;
  }

  if (batch_id) {
    query.batch_id = batch_id;
  }

  return CourseProgress.countDocuments(query);
};

const aggregate = (pipeline: PipelineStage[]) => {
  return CourseProgress.aggregate(pipeline);
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
