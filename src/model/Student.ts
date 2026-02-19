import { model, Schema } from 'mongoose';

export type StudentTypes = {
  name: string;
  email: string;
  code: string;
  image: string;
  batch_id: object;
  admission_date: Date;
  courses: { course_id: object; status: 'YES' | 'NO' }[];
  course_mode: 'ONLINE' | 'OFFLINE';
  country_id: object;
  district_id: object;
  police_station_id: object;
  village: String;
  nationality: object;
  office_address: string;
  dob: Date;
  occupation: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  nid_no: string;
  co_mobile: string;
  relationship: string;
  education: string;
  total_amount: string;
  total_paid: string;
  discount: string;
  additional_discount: string;
  installment_date: { name: string; date: Date }[];
  status: 'ACTIVE' | 'INACTIVE';
};

const StudentSchema = new Schema<StudentTypes>(
  {
    name: { type: String, required: false, trim: true },
    email: { type: String, required: false, trim: true },
    code: { type: String, required: false, trim: true },
    image: { type: String, required: false },
    batch_id: { type: Object, required: false, trim: true },
    admission_date: { type: Date, required: false },
    courses: [
      {
        course_id: Object,
        status: { type: String, enum: ['YES', 'NO'], default: 'NO' },
      },
    ],
    course_mode: { type: String, enum: ['ONLINE', 'OFFLINE'], required: false },
    country_id: { type: Object, required: false },
    district_id: { type: Object, required: false },
    police_station_id: { type: Object, required: false },
    village: { type: String, required: false },
    nationality: { type: Object, required: false },
    office_address: { type: String, required: false },
    dob: { type: Date, required: false },
    occupation: { type: String, required: false },
    gender: {
      type: String,
      enum: ['MALE', 'FEMALE', 'OTHER'],
      required: false,
    },
    nid_no: { type: String, required: false },
    co_mobile: { type: String, required: false },
    relationship: { type: String, required: false },
    education: { type: String, required: false },
    total_amount: { type: String, required: false },
    total_paid: { type: String, required: false },
    discount: { type: String, default: '0' },
    additional_discount: { type: String, default: '0' },
    installment_date: [
      {
        name: { type: String, default: '' },
        date: { type: Object, default: null },
      },
    ],
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  {
    timestamps: true,
  },
);

const Student = model('Student', StudentSchema);
export default Student;
