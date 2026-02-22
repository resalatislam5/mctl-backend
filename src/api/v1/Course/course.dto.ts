import { Document } from 'mongoose';

export interface ICreateCourse extends Document {
  name: string;
  price: number;
  status: 'ACTIVE' | 'INACTIVE';
}
export interface ICourseList {
  _id?: string;
  name: string;
  price: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface ICourseFindAllParams {
  search?: string;
  status: 'ACTIVE' | 'INACTIVE';
}
