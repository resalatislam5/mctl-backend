import { model, Schema, Types } from 'mongoose';
import { ICreateEnrollment } from './enrollment.dto';

const EnrollmentSchema = new Schema<ICreateEnrollment>(
  {
    student_id: {
      type: Types.ObjectId,
      required: true,
      ref: 'Student',
    },
    agent_id: {
      type: Types.ObjectId,
      ref: 'Agent',
    },
    tenant_id: {
      type: Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    installment_type: {
      type: String,
      enum: ['YES', 'NO'],
    },
    code: {
      type: String,
      unique: true,
    },

    batch_id: { type: Types.ObjectId, required: true, ref: 'Batch' },
    admission_date: { type: Date, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'],
      default: 'PENDING',
    },
    courses: [
      {
        course_id: {
          type: Types.ObjectId,
          required: true,
          ref: 'Course',
        },
        status: { type: String, enum: ['YES', 'NO'], default: 'NO' },
        soft_copy: { type: String, enum: ['YES', 'NO'], default: 'NO' },
        _id: false,
      },
    ],
    course_ids: {
      type: [Types.ObjectId],
      ref: 'Course',
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
      ref: 'Package',
    },

    total_amount: { type: Number, required: true },
    meal_accommodation: { type: Number, required: true, default: 0 },
    total_price: { type: Number, required: true },
    total_paid: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    additional_discount: { type: Number, default: 0 },

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
