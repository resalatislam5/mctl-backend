import { Document, Schema } from 'mongoose';

export interface ICreateStudent extends Document {
  name: string;
  email: string;
  code: string;
  image: string;

  country_id: Schema.Types.ObjectId;
  division_id: Schema.Types.ObjectId;
  district_id: Schema.Types.ObjectId;
  upazila_id: Schema.Types.ObjectId;
  village: string;
  nationality: string;

  office_address: string;
  dob: Date;
  occupation: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';

  nid_no: string;
  co_mobile: string;
  mobile_no: string;
  relationship: string;
  education: string;
  image_public_id: string;
  status: 'ACTIVE' | 'INACTIVE';
}
export interface IStudentList {
  _id?: string;
  name: string;
  email: string;
  code: string;
  image: string;

  country_id: object;
  district_id: object;
  division_id: object;
  upazila_id: object;
  village: string;
  nationality: string;

  office_address: string;
  dob: Date;
  occupation: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';

  nid_no: string;
  co_mobile: string;
  mobile_no: string;
  relationship: string;
  education: string;
  image_public_id: string;

  status: 'ACTIVE' | 'INACTIVE';
}

export interface IStudentFindAllParams {
  search?: string;
  student_id?: string;
  status: 'ACTIVE' | 'INACTIVE';
}
