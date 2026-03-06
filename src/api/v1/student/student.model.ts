import { model, Schema } from 'mongoose';
import { ICreateStudent } from './student.dto';

const StudentSchema = new Schema<ICreateStudent>(
  {
    name: { type: String, trim: true },
    email: { type: String, trim: true },
    code: { type: String, trim: true },
    image: { type: String },

    country_id: { type: Schema.Types.ObjectId },
    division_id: { type: Schema.Types.ObjectId },
    district_id: { type: Schema.Types.ObjectId },
    upazila_id: { type: Schema.Types.ObjectId },
    village: { type: String },
    nationality: { type: String },

    office_address: { type: String },
    dob: { type: Date },
    occupation: { type: String },

    gender: {
      type: String,
      enum: ['MALE', 'FEMALE', 'OTHER'],
    },

    nid_no: { type: String },
    co_mobile: { type: String },
    relationship: { type: String },
    education: { type: String },
    image_public_id: { type: String },

    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  { timestamps: true },
);

export const Student = model('Student', StudentSchema);
