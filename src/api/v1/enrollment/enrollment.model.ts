import { model, Schema, Types } from 'mongoose';
import { ICreateEnrollment } from './enrollment.dto';

const EnrollmentSchema = new Schema<ICreateEnrollment>(
  {
    student_id: {
      type: Types.ObjectId,
      required: true,
      schema: 'Student',
    },
    agent_id: {
      type: Types.ObjectId,
      required: true,
      schema: 'Agent',
    },
    installment_type: {
      type: String,
      enum: ['YES', 'NO'],
    },
    code: {
      type: String,
      unique: true,
    },

    batch_id: { type: Types.ObjectId, required: true, schema: 'Batch' },
    admission_date: { type: Date, required: true },

    courses: [
      {
        course_id: {
          type: Types.ObjectId,
          required: true,
          schema: 'Course',
        },
        status: { type: String, enum: ['YES', 'NO'], default: 'NO' },
        soft_copy: { type: String, enum: ['YES', 'NO'], default: 'NO' },
        _id: false,
      },
    ],
    course_ids: {
      type: [Types.ObjectId],
      schema: 'Course',
    },

    course_mode: {
      type: String,
      required: true,
      enum: ['ONLINE', 'OFFLINE'],
    },
    course_type: {
      type: String,
      required: true,
      enum: ['SPECIFIC', 'PACKAGE'],
    },
    package_id: {
      type: Types.ObjectId,
      schema: 'Package',
    },

    total_amount: { type: String, required: true },
    meal_accommodation: { type: String, required: true, default: '0' },
    total_price: { type: String, required: true },
    total_paid: { type: String, default: '0' },
    discount: { type: String, default: '0' },
    additional_discount: { type: String, default: '0' },

    installment_date: [
      {
        name: { type: String },
        date: { type: Date },
        _id: false,
      },
    ],
  },
  { timestamps: true },
);

export const Enrollment = model('Enrollment', EnrollmentSchema);
