import mongoose, { model, Schema } from 'mongoose';
import { ICreateRole } from './role.dto';

const RoleSchema = new Schema<ICreateRole>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    permissions: {
      type: [
        {
          module_id: {
            type: Schema.Types.ObjectId,
            ref: 'Module',
            required: true,
          },

          can_create: { type: Boolean, default: false },
          can_read: { type: Boolean, default: false },
          can_update: { type: Boolean, default: false },
          can_delete: { type: Boolean, default: false },
        },
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      trim: true,
      default: 'ACTIVE',
    },
  },
  { timestamps: true },
);

const Role = model('Role', RoleSchema);
export default Role;
