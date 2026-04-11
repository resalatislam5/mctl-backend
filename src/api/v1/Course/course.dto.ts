import { Document, Types } from 'mongoose';
import { IStatus } from '../../../types/commonTypes';

export interface IBaseCourse {
  name: string;
  price: number;
  status: IStatus;
  tenant_id: Types.ObjectId;
}
export interface ICreateCourse extends IBaseCourse, Document {}
export interface ICourseList extends IBaseCourse {
  _id?: Types.ObjectId;
}

export interface ICourseFindAllParams {
  search?: string;
  status: IStatus;
  tenant_id: Types.ObjectId;
}
