import { Document, Types } from 'mongoose';

export type IEnrollmentStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';

export interface IBaseEnrollment {
  student_id: Types.ObjectId;
  batch_id: Types.ObjectId;
  agent_id: Types.ObjectId;
  code: string;
  admission_date: Date;
  installment_type: 'YES' | 'NO';
  course_ids: Types.ObjectId[];
  course_mode: 'ONLINE' | 'OFFLINE';
  total_price: number;
  course_type: 'SPECIFIC' | 'PACKAGE';
  package_id: Types.ObjectId | null;
  tenant_id: Types.ObjectId;
  total_amount: number;
  total_paid: number;
  meal_accommodation: number;
  discount: number;
  additional_discount: number;
  installment_date: { name: string; date: Date }[];
  status: IEnrollmentStatus;
}
export interface ICreateEnrollment extends IBaseEnrollment, Document {}
export interface IEnrollmentList extends IBaseEnrollment {
  _id?: string | Types.ObjectId;
}

export interface IEnrollmentFindAllParams {
  search?: string;
  student_id?: Types.ObjectId;
  agent_id?: Types.ObjectId;
  batch_id?: Types.ObjectId;
  tenant_id: Types.ObjectId;
  installment_date?: object;
  status?: IEnrollmentStatus;
}
