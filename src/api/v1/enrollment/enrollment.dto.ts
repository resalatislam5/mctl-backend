import { Document, Types } from 'mongoose';

export interface ICreateEnrollment extends Document {
  student_id: Types.ObjectId;
  batch_id: Types.ObjectId;
  agent_id: Types.ObjectId;
  code: string;
  admission_date: Date;
  courses: {
    course_id: Types.ObjectId;
    status: 'YES' | 'NO';
    soft_copy: 'YES' | 'NO';
  }[];
  installment_type: 'YES' | 'NO';
  course_ids: Types.ObjectId[];
  course_mode: 'ONLINE' | 'OFFLINE';
  total_price: string;
  course_type: 'SPECIFIC' | 'PACKAGE';
  package_id: Types.ObjectId;
  total_amount: string;
  total_paid: string;
  meal_accommodation: string;
  discount: string;
  additional_discount: string;
  installment_date: { name: string; date: Date }[];
}
export interface IEnrollmentList {
  _id?: string;
  code: string;
  student_id: Types.ObjectId;
  batch_id: Types.ObjectId;
  agent_id: Types.ObjectId;
  admission_date: Date;
  course_ids: Types.ObjectId[];
  courses: {
    course_id: Types.ObjectId;
    status: 'YES' | 'NO';
    soft_copy: 'YES' | 'NO';
  }[];
  course_mode: 'ONLINE' | 'OFFLINE';
  installment_type: 'YES' | 'NO';
  course_type: 'SPECIFIC' | 'PACKAGE';
  package_id: Types.ObjectId;
  total_price: string;
  total_amount: string;
  meal_accommodation: string;
  total_paid: string;
  discount: string;
  additional_discount: string;
  installment_date: { name: string; date: Date }[];
}

export interface IEnrollmentFindAllParams {
  search?: string;
  student_id?: string;
  installment_date?: object;
}
