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
        status: { type: String, enum: ['YES', 'NO'], default: 'NO' },
        soft_copy: { type: String, enum: ['YES', 'NO'], default: 'NO' },
        _id: false,
      },
    ],
  },
  { timestamps: true },
);

export const CourseProgress = model('CourseProgress', CourseProgressSchema);
