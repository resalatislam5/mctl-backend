import { model, Schema } from 'mongoose';
import { ICreateCourse } from './course.dto';

const CourseSchema = new Schema<ICreateCourse>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      indexes: true,
    },
    price: {
      type: Number,
      required: true,
      trim: true,
      indexes: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      trim: true,
      default: 'ACTIVE',
    },
  },
  {
    timestamps: true,
  },
);

const Course = model('Course', CourseSchema);
export default Course;
