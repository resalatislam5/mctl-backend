import { Document, Types } from 'mongoose';

export interface IBaseCourseProgress {
  student_id: Types.ObjectId;
  enrollment_id: Types.ObjectId;
  batch_id: Types.ObjectId;
  tenant_id: Types.ObjectId;
  courses: {
    course_id: Types.ObjectId;
    status: 'YES' | 'NO';
    soft_copy: 'YES' | 'NO';
  }[];
  // status: 'COMPLETED' | 'ABSENT' | 'ON_GOING';
}

export interface ICreateCourseProgress extends IBaseCourseProgress, Document {}
export interface ICourseProgressList extends IBaseCourseProgress {
  _id?: string | Types.ObjectId;
}

export interface ICourseProgressFindAllParams {
  search?: string;
  student_id?: Types.ObjectId;
  batch_id?: Types.ObjectId;
  tenant_id: Types.ObjectId;
}
