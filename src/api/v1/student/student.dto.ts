import { Document, Types } from 'mongoose';
import { IGender, IStatus } from '../../../types/commonTypes';

export interface IStudentBase {
  name: string;
  email: string;
  code: string;
  image: string;
  country_id: Types.ObjectId;
  division_id: Types.ObjectId;
  district_id: Types.ObjectId;
  upazila_id: Types.ObjectId;
  village: string;
  nationality: string;
  office_address: string;
  dob: Date;
  occupation: string;
  gender: IGender;
  nid_no: string;
  co_mobile: string;
  mobile_no: string;
  relationship: string;
  education: string;
  image_public_id: string;
  status: IStatus;
  tenant_id: Types.ObjectId;
}

export interface ICreateStudent extends IStudentBase, Document {}
export interface IStudentList extends IStudentBase {
  _id?: Types.ObjectId | string;
}

export interface IStudentFindAllParams {
  search?: string;
  student_id?: Types.ObjectId;
  tenant_id: Types.ObjectId;
  status: IStatus;
}
