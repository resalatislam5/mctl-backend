import { model, Schema, Types } from 'mongoose';
import { ICreateCourseProgress } from './courseProgress.dto';

const CourseProgressSchema = new Schema<ICreateCourseProgress>(
  {
    student_id: {
      type: Types.ObjectId,
      required: true,
      ref: 'Student',
    },

    tenant_id: {
      type: Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },

    batch_id: { type: Types.ObjectId, required: true, ref: 'Batch' },
    enrollment_id: { type: Types.ObjectId, required: true, ref: 'Enrollment' },

    courses: [
      {
        course_id: {
          type: Types.ObjectId,
          required: true,
          ref: 'Course',
        },
        certificate_no: { type: String, default: null },
        delivery_date: { type: String, default: null },
        certificate_status: {
          type: String,
          enum: ['REQUESTED', 'ISSUED_BY_BOARD', 'PRINTED'],
          default: null,
        },
        doll_card_status: {
          type: String,
          enum: ['REQUESTED', 'ISSUED_BY_BOARD', 'PRINTED'],
          default: null,
        },
        delivery_status: {
          type: String,
          enum: ['ONLINE_COPY', 'HARD_COPY'],
          default: null,
        },
        completion_status: {
          type: String,
          enum: ['ONGOING', 'COMPLETED', 'ABSENT', 'CANCELLED'],
          default: 'ONGOING',
        },
        _id: false,
      },
    ],
    status: {
      type: String,
      enum: ['ONGOING', 'COMPLETED'],
      default: 'ONGOING',
    },
  },
  { timestamps: true },
);

export const CourseProgress = model('CourseProgress', CourseProgressSchema);
