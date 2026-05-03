import { Document, Types } from 'mongoose';

export type CertificateStatusType =
  | 'REQUESTED'
  | 'ISSUED_BY_BOARD'
  | 'PRINTED'
  | null;
export type CompletionStatusType =
  | 'ONGOING'
  | 'COMPLETED'
  | 'ABSENT'
  | 'CANCELLED';
export interface IBaseCourseProgress {
  student_id: Types.ObjectId;
  enrollment_id: Types.ObjectId;
  batch_id: Types.ObjectId;
  tenant_id: Types.ObjectId;
  courses: {
    course_id: Types.ObjectId;
    certificate_no?: string | null;
    delivery_date?: string | null;
    certificate_status?: CertificateStatusType;
    doll_card_status?: CertificateStatusType;
    delivery_status?: 'ONLINE_COPY' | 'HARD_COPY' | null;
    completion_status?: CompletionStatusType;
  }[];
  status?: 'COMPLETED' | 'ONGOING';
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
